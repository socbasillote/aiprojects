import type { Response } from "express";
import { z } from "zod";
import { Booking } from "../models/Booking.js";
import { Business } from "../models/Business.js";
import { sendBookingConfirmation } from "../services/email.service.js";
import type { AuthRequest } from "../middleware/auth.js";

const bookingSchema = z.object({
  customer: z.string().trim().min(2),
  email: z.string().email(),
  service: z.string().trim().min(2),
  staff: z.string().trim().min(2).default("Maria"),
  date: z.string().min(8),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  status: z
    .enum(["Pending", "Confirmed", "Completed", "Rejected"])
    .default("Pending"),
  payment: z.enum(["Unpaid", "Deposit", "Paid"]),
  paymentMethod: z.enum([
    "Cash",
    "Card",
    "GCash",
    "Bank transfer",
    "PayPal",
    "PayMongo",
  ]),
});

const updateBookingSchema = bookingSchema.partial();

export async function listBookings(req: AuthRequest, res: Response) {
  const businessId = req.businessId;
  if (!businessId) {
    return res
      .status(400)
      .json({ success: false, message: "Business context is required" });
  }

  const bookings = await Booking.find({ businessId }).sort({
    date: 1,
    time: 1,
  });
  return res.json({ success: true, data: { bookings } });
}

export async function createBooking(req: AuthRequest, res: Response) {
  const businessId = req.businessId;
  if (!businessId) {
    return res
      .status(400)
      .json({ success: false, message: "Business context is required" });
  }

  const payload = bookingSchema.parse(req.body);
  const confirmationCode = `SB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const booking = await Booking.create({
    ...payload,
    businessId,
    confirmationCode,
  });

  return res.status(201).json({ success: true, data: { booking } });
}

export async function updateBooking(req: AuthRequest, res: Response) {
  const businessId = req.businessId;
  if (!businessId) {
    return res
      .status(400)
      .json({ success: false, message: "Business context is required" });
  }

  const booking = await Booking.findOne({ _id: req.params.id, businessId });
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  }

  const payload = updateBookingSchema.parse(req.body);
  const wasPending = booking.status === "Pending";
  const isCashApproval =
    booking.paymentMethod === "Cash" &&
    wasPending &&
    payload.status === "Confirmed";

  Object.assign(booking, payload);
  await booking.save();

  if (isCashApproval && !booking.confirmationEmailSentAt) {
    const business = await Business.findById(businessId).select("name");
    const statusPageUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/status/${booking.confirmationCode}`;
    const email = await sendBookingConfirmation({
      to: booking.email,
      customer: booking.customer,
      business: business?.name ?? "Booking",
      service: booking.service,
      date: booking.date,
      time: booking.time,
      paymentMethod: booking.paymentMethod,
      payment: booking.payment,
      confirmationCode: booking.confirmationCode,
      statusPageUrl,
    });

    if (email.delivered) {
      booking.confirmationEmailSentAt = new Date();
      await booking.save();
    }
  }

  return res.json({ success: true, data: { booking } });
}
