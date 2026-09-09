import { Schema, model, type Document, type Types } from "mongoose";

export interface IBooking extends Document {
  businessId: Types.ObjectId;
  customer: string;
  email: string;
  service: string;
  date: string;
  time: string;
  paymentMethod: "Cash" | "Card" | "GCash" | "Bank transfer";
  status: "Pending" | "Confirmed";
  confirmationCode: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
  customer: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  service: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  paymentMethod: { type: String, enum: ["Cash", "Card", "GCash", "Bank transfer"], required: true },
  status: { type: String, enum: ["Pending", "Confirmed"], default: "Pending" },
  confirmationCode: { type: String, required: true, unique: true },
}, { timestamps: true });

export const Booking = model<IBooking>("Booking", bookingSchema);
