import type { Request, Response } from "express";
import { z } from "zod";
import { Business } from "../models/Business.js";
import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { sendBookingConfirmation } from "../services/email.service.js";

const bookingSchema = z.object({
  customer: z.string().trim().min(2),
  email: z.string().email(),
  service: z.string().trim().min(2),
  staff: z.string().trim().min(2).default("Maria"),
  date: z.string().min(8),
  time: z.string().min(4),
  payment: z.enum(["Unpaid", "Deposit", "Paid"]).default("Unpaid"),
  paymentMethod: z.enum(["Cash", "Card", "GCash", "Bank transfer"]),
});

export async function getPublicBusiness(req: Request, res: Response) {
  const business = await Business.findOne({ slug: req.params.slug, isActive: true }).select("name slug description");
  if (!business) return res.status(404).json({ success: false, message: "Booking page not found" });

  const services = await Service.find({ businessId: business._id, isActive: true, onlineBookingEnabled: true }).sort({ name: 1 }).select("name price durationMinutes description");

  return res.json({
    success: true,
    data: {
      business,
      services: services.map((service) => ({
        id: service._id.toString(),
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        description: service.description,
      })),
    },
  });
}

export async function createPublicBooking(req: Request, res: Response) {
  const input = bookingSchema.parse(req.body);
  const business = await Business.findOne({ slug: req.params.slug, isActive: true });
  if (!business) return res.status(404).json({ success: false, message: "Booking page not found" });

  const confirmationCode = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const booking = await Booking.create({
    ...input,
    businessId: business._id,
    confirmationCode,
    status: "Pending",
  });

  const email = await sendBookingConfirmation({
    to: input.email,
    customer: input.customer,
    business: business.name,
    service: input.service,
    date: input.date,
    time: input.time,
    paymentMethod: input.paymentMethod,
    confirmationCode,
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
