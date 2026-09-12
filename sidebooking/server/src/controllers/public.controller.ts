import type { Request, Response } from "express";
import { z } from "zod";
import QRCode from "qrcode";
import { Business } from "../models/Business.js";
import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { sendBookingConfirmation } from "../services/email.service.js";

function minutesFromTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

const bookingSchema = z.object({
  customer: z.string().trim().min(2),
  email: z.string().email(),
  service: z.string().trim().min(2),
  staff: z.string().trim().min(2).default("Maria"),
  court: z.string().trim().min(1).default("Court 1"),
  date: z.string().min(8),
  time: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/),
  payment: z.enum(["Unpaid", "Deposit", "Paid"]).default("Unpaid"),
  paymentMethod: z.enum(["Cash", "Card", "GCash", "Bank transfer", "PayPal"]),
});

export async function getPublicBusiness(req: Request, res: Response) {
  const business = await Business.findOne({
    slug: req.params.slug,
    isActive: true,
  }).select("name slug description openHour closeHour slotsPerHour courtsCount settings");
  if (!business)
    return res
      .status(404)
      .json({ success: false, message: "Booking page not found" });

  const services = await Service.find({
    businessId: business._id,
    isActive: true,
    onlineBookingEnabled: true,
  })
    .sort({ name: 1 })
    .select("name price durationMinutes description");

  const bookings = await Booking.find({
    businessId: business._id,
  })
    .select("date time court")
    .lean();

  const slotsPerHour =
    business.slotsPerHour ?? business.settings?.booking?.slotsPerHour ?? 2;
  const courtsCount = business.courtsCount ?? 3;

  return res.json({
    success: true,
    data: {
      business: {
        name: business.name,
        slug: business.slug,
        description: business.description,
        openHour: business.openHour ?? "08:00",
        closeHour: business.closeHour ?? "20:00",
        slotsPerHour,
        courtsCount,
      },
      services: services.map((service) => ({
        id: service._id.toString(),
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        description: service.description,
      })),
      bookings: bookings.map((booking) => ({
        date: booking.date,
        time: booking.time,
        court: booking.court,
      })),
    },
  });
}

export async function getBookingStatusByCode(req: Request, res: Response) {
  const confirmationCode = String(req.params.confirmationCode ?? "").trim();
  if (!confirmationCode) {
    return res
      .status(400)
      .json({ success: false, message: "Confirmation code is required." });
  }

  const booking = await Booking.findOne({ confirmationCode }).lean();
  if (!booking) {
    return res
      .status(404)
      .json({ success: false, message: "Booking status not found." });
  }

  const business = await Business.findById(booking.businessId)
    .select("name")
    .lean();

  const qr = await QRCode.toDataURL(confirmationCode, {
    margin: 1,
    width: 220,
  });

  return res.json({
    success: true,
    data: {
      booking: {
        id: String(booking._id),
        confirmationCode,
        customer: booking.customer,
        email: booking.email,
        service: booking.service,
        staff: booking.staff,
        date: booking.date,
        time: booking.time,
        payment: booking.payment,
        paymentMethod: booking.paymentMethod,
        status: booking.status,
        business: business?.name ?? "Booking",
      },
      qr,
      emailDelivered: false,
    },
  });
}

export async function createPublicBooking(req: Request, res: Response) {
  const input = bookingSchema.parse(req.body);
  const business = await Business.findOne({
    slug: req.params.slug,
    isActive: true,
  });
  if (!business)
    return res
      .status(404)
      .json({ success: false, message: "Booking page not found" });

  const openMinutes = minutesFromTime(business.openHour ?? "08:00");
  const closeMinutes = minutesFromTime(business.closeHour ?? "20:00");
  const selectedMinutes = minutesFromTime(input.time);

  if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
    return res.status(400).json({
      success: false,
      message: "Booking time must be inside the business open hours.",
    });
  }

  const existing = await Booking.findOne({
    businessId: business._id,
    date: input.date,
    time: input.time,
    court: input.court,
  }).select("_id");

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "That date, court, and time is already fully booked.",
    });
  }

  const normalizedPayment =
    input.paymentMethod === "PayPal" ? "Paid" : input.payment;
  const confirmationCode = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const booking = await Booking.create({
    ...input,
    payment: normalizedPayment,
    businessId: business._id,
    confirmationCode,
    status: "Pending",
  });

  const statusPageUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/status/${confirmationCode}`;
  const email = await sendBookingConfirmation({
    to: input.email,
    customer: input.customer,
    business: business.name,
    service: input.service,
    date: input.date,
    time: input.time,
    paymentMethod: input.paymentMethod,
    payment: normalizedPayment,
    confirmationCode,
    statusPageUrl,
  });

  return res.status(201).json({
    success: true,
    data: {
      booking: { id: booking._id, confirmationCode, status: booking.status },
      qr: email.qr,
      emailDelivered: email.delivered,
    },
  });
}
