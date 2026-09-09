import { Schema, model, type Document, type Types } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Business = model<IBusiness>("Business", businessSchema);
