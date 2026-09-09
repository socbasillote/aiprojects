import type { Response } from "express";
import { z } from "zod";
import { Business } from "../models/Business.js";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.js";

const businessSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(500).optional().default(""),
});

export async function getBusiness(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  const business = user?.businessIds?.[0] ? await Business.findById(user.businessIds[0]) : null;
  return res.json({ success: true, data: { business } });
}

export async function saveBusiness(req: AuthRequest, res: Response) {
  const input = businessSchema.parse(req.body);
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  let business = user.businessIds[0] ? await Business.findById(user.businessIds[0]) : null;
  if (business) {
    Object.assign(business, input);
    await business.save();
  } else {
    business = await Business.create({ ...input, ownerId: user._id });
    user.businessIds = [business._id];
    await user.save();
  }
  return res.json({ success: true, data: { business } });
}
