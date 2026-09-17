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
  court: z.string().trim().min(1).default("Court 1").optional(),
  date: z.string().min(8),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  slots: z
    .array(
      z.object({
        court: z.string().trim().min(1),
        time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      }),
    )
    .optional(),
  payment: z.enum(["Unpaid", "Deposit", "Paid"]).default("Unpaid"),
  paymentMethod: z.enum(["Cash", "Card", "GCash", "Bank transfer", "PayPal"]),
});

export async function getPublicBusiness(req: Request, res: Response) {
  const business = await Business.findOne({
    slug: req.params.slug,
    isActive: true,
  }).select(
    "name slug description openHour closeHour slotsPerHour slotIntervalMinutes isOpen24Hours courtsCount disabledCourts settings",
  );
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
    status: { $ne: "Rejected" },
  })
    .select("date time court")
    .lean();

  const slotsPerHour =
    business.slotsPerHour ?? business.settings?.booking?.slotsPerHour ?? 2;
  const slotIntervalMinutes =
    business.slotIntervalMinutes ??
    business.settings?.booking?.slotIntervalMinutes ??
    30;
  const courtsCount = business.courtsCount ?? 3;
  const isOpen24Hours =
    Boolean(business.isOpen24Hours) ||
    (business.openHour === "00:00" && business.closeHour === "23:30");
  const disabledCourts = Array.isArray(business.disabledCourts)
    ? business.disabledCourts
    : [];

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
        slotIntervalMinutes,
        isOpen24Hours,
        courtsCount,
        disabledCourts,
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

  const isOpen24Hours =
    Boolean(business.isOpen24Hours) ||
    (business.openHour === "00:00" && business.closeHour === "23:30");
  const openMinutes = minutesFromTime(business.openHour ?? "08:00");
  const closeMinutes = isOpen24Hours
    ? 24 * 60
    : minutesFromTime(business.closeHour ?? "20:00");
  const slotIntervalMinutes =
    business.slotIntervalMinutes ??
    business.settings?.booking?.slotIntervalMinutes ??
    30;
  const disabledCourts = new Set(
    (business.disabledCourts ?? []).map((court) => court.trim()),
  );

  const chosenSlots = input.slots?.length
    ? input.slots
    : [{ court: input.court ?? "Court 1", time: input.time ?? "" }];

  if (!chosenSlots.length) {
    return res.status(400).json({
      success: false,
      message: "Choose at least one valid booking time.",
    });
  }

  for (const slot of chosenSlots) {
    if (disabledCourts.has(slot.court)) {
      return res.status(400).json({
        success: false,
        message: `Court ${slot.court} is currently unavailable for booking.`,
      });
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.time)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid booking time in the business schedule.",
      });
    }

    const selectedMinutes = minutesFromTime(slot.time);
    if ((selectedMinutes - openMinutes) % slotIntervalMinutes !== 0) {
      return res.status(400).json({
        success: false,
        message: `Choose booking times in ${slotIntervalMinutes}-minute steps.`,
      });
    }

    if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
      return res.status(400).json({
        success: false,
        message: "Booking time must be inside the business open hours.",
      });
    }
  }

  const normalizedPayment =
    input.paymentMethod === "PayPal" ? "Paid" : input.payment;

  const created = [];
  for (const slot of chosenSlots) {
    const existing = await Booking.findOne({
      businessId: business._id,
      date: input.date,
      time: slot.time,
      court: slot.court,
      status: { $ne: "Rejected" },
    }).select("_id");

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `That date, court, and time is already fully booked: ${slot.court} ${slot.time}`,
      });
    }
  }

  for (const slot of chosenSlots) {
    const confirmationCode = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const booking = await Booking.create({
      customer: input.customer,
      email: input.email,
      service: input.service,
      staff: input.staff,
      court: slot.court,
      date: input.date,
      time: slot.time,
      payment: normalizedPayment,
      paymentMethod: input.paymentMethod,
      businessId: business._id,
      confirmationCode,
      status: "Pending",
    });

    created.push(booking);
  }

  const statusPageUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/status/${created[0].confirmationCode}`;
  const firstBooking = created[0];
  const email = await sendBookingConfirmation({
    to: input.email,
    customer: input.customer,
    business: business.name,
    service: input.service,
    date: input.date,
    time: chosenSlots.map((slot) => slot.time).join(", "),
    paymentMethod: input.paymentMethod,
    payment: normalizedPayment,
    confirmationCode: firstBooking.confirmationCode,
    statusPageUrl,
  });

  return res.status(201).json({
    success: true,
    data: {
      booking: {
        id: firstBooking._id,
        confirmationCode: firstBooking.confirmationCode,
        status: firstBooking.status,
      },
      qr: email.qr,
      emailDelivered: email.delivered,
    },
  });
}
