import type { Request, Response } from "express";
import { z } from "zod";
import { Business } from "../models/Business.js";
import { Booking } from "../models/Booking.js";
import { sendBookingConfirmation } from "../services/email.service.js";

const bookingSchema = z.object({ customer: z.string().trim().min(2), email: z.string().email(), service: z.string().trim().min(2), date: z.string().min(8), time: z.string().min(4), paymentMethod: z.enum(["Cash", "Card", "GCash", "Bank transfer"]) });

export async function getPublicBusiness(req: Request, res: Response) {
  const business = await Business.findOne({ slug: req.params.slug, isActive: true }).select("name slug description");
  if (!business) return res.status(404).json({ success: false, message: "Booking page not found" });
  return res.json({ success: true, data: { business, services: ["Haircut", "Hair Coloring", "Facial", "Massage"] } });
}

export async function createPublicBooking(req: Request, res: Response) {
  const input = bookingSchema.parse(req.body);
  const business = await Business.findOne({ slug: req.params.slug, isActive: true });
  if (!business) return res.status(404).json({ success: false, message: "Booking page not found" });
  const confirmationCode = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const booking = await Booking.create({ ...input, businessId: business._id, confirmationCode, status: "Pending" });
  const email = await sendBookingConfirmation({ to: input.email, ...input, business: business.name, confirmationCode });
  return res.status(201).json({ success: true, data: { booking: { id: booking._id, confirmationCode, status: booking.status }, qr: email.qr, emailDelivered: email.delivered } });
}
