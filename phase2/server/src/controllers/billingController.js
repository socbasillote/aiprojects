import { z } from "zod";
import { env } from "../config/env.js";
import { PAYPAL_PACKAGES } from "../config/paypal.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
} from "../services/paypalService.js";
import { ensureAiCredits } from "../utils/aiCredits.js";

const packageSchema = z.object({
  packageId: z.enum(Object.keys(PAYPAL_PACKAGES)),
});
const captureSchema = z.object({ orderId: z.string().min(1).max(50) });

const publicPackage = (pkg) => ({
  id: pkg.id,
  name: pkg.name,
  credits: pkg.credits,
  price: pkg.price,
  currency: pkg.currency,
});

export function getPackages(req, res) {
  if (!env.paypalClientId)
    return res
      .status(503)
      .json({ message: "PayPal payments are not configured." });
  res.json({
    clientId: env.paypalClientId,
    environment: env.paypalEnvironment,
    packages: Object.values(PAYPAL_PACKAGES).map(publicPackage),
  });
}

export async function getCredits(req, res) {
  await ensureAiCredits(req.user);
  res.json({ credits: req.user.aiCredits ?? 20 });
}

export async function createOrder(req, res) {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    return res.status(503).json({
      message:
        "PayPal payments are not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the server environment.",
    });
  }

  const { packageId } = packageSchema.parse(req.body);

  const packageInfo = PAYPAL_PACKAGES[packageId];

  if (!packageInfo) {
    return res.status(400).json({
      message: "Invalid PayPal package.",
    });
  }

  try {
    console.log("[PayPal] Creating order", {
      userId: req.user._id.toString(),

      packageId,

      amount: packageInfo.price,

      currency: packageInfo.currency,

      environment: env.paypalEnvironment,
    });

    const order = await createPayPalOrder({
      packageInfo,
      customId: req.user._id.toString(),
    });

    if (!order?.id) {
      throw new Error("PayPal did not return an order ID.");
    }

    await Payment.create({
      userId: req.user._id,
      paypalOrderId: order.id,
      packageId,
      credits: packageInfo.credits,
      amount: packageInfo.price,
      currency: packageInfo.currency,
      status: "CREATED",
    });

    return res.status(201).json({
      orderId: order.id,
      package: publicPackage(packageInfo),
    });
  } catch (error) {
    console.error("[PayPal] Create order controller error", {
      userId: req.user?._id?.toString(),

      packageId,

      paypalName: error?.paypalName,

      paypalStatus: error?.status,

      debugId: error?.debugId,

      message: error?.message,

      details: error?.details,

      paypal: error?.paypal,
    });

    return res.status(502).json({
      message: "Unable to create the PayPal payment. Please try again.",
    });
  }
}

export async function captureOrder(req, res) {
  const { orderId } = captureSchema.parse(req.body);
  const payment = await Payment.findOne({
    paypalOrderId: orderId,
    userId: req.user._id,
  });
  if (!payment)
    return res.status(404).json({ message: "PayPal order not found." });
  if (payment.status === "COMPLETED") {
    const user = await User.findById(req.user._id).select("aiCredits");
    return res.json({
      success: true,
      alreadyProcessed: true,
      credits: user?.aiCredits ?? 0,
      paymentId: payment._id.toString(),
    });
  }

  let paypalOrder = await getPayPalOrder(orderId);
  if (paypalOrder.status !== "COMPLETED") {
    paypalOrder = await capturePayPalOrder(orderId);
  }

  const captureRecord =
    paypalOrder?.purchase_units?.[0]?.payments?.captures?.[0];
  const capturedAmount = captureRecord?.amount?.value;
  const capturedCurrency = captureRecord?.amount?.currency_code;

  if (
    paypalOrder?.status !== "COMPLETED" ||
    captureRecord?.status !== "COMPLETED" ||
    capturedAmount !== payment.amount ||
    capturedCurrency !== payment.currency
  ) {
    payment.status = "FAILED";
    await payment.save();
    const error = new Error(
      "PayPal payment could not be verified as completed.",
    );
    error.status = 402;
    throw error;
  }

  const session = await mongoose.startSession();
  try {
    let credits = 0;
    await session.withTransaction(async () => {
      const updatedPayment = await Payment.findOneAndUpdate(
        { _id: payment._id, status: "CREATED" },
        {
          $set: {
            status: "COMPLETED",
            paypalCaptureId: captureRecord.id || null,
          },
        },
        { new: true, session },
      );
      if (!updatedPayment) {
        const existingUser = await User.findById(req.user._id)
          .select("aiCredits")
          .session(session);
        credits = existingUser?.aiCredits ?? 0;
        return;
      }
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { aiCredits: payment.credits } },
        { new: true, session },
      ).select("aiCredits");
      credits = user.aiCredits;
    });
    const latestPayment = await Payment.findById(payment._id).select("status");
    if (latestPayment?.status === "COMPLETED") {
      const user = await User.findById(req.user._id).select("aiCredits");
      credits = user?.aiCredits ?? credits;
    }
    res.json({
      success: true,
      credits,
      addedCredits: payment.credits,
      paymentId: payment._id.toString(),
    });
  } finally {
    await session.endSession();
  }
}
