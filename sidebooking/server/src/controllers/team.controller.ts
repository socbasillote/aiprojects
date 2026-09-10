import type { Response } from "express";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.js";

export async function listTeam(req: AuthRequest, res: Response) {
  const businessId = req.businessId;
  if (!businessId) {
    return res.status(400).json({ success: false, message: "Business context is required" });
  }

  const users = await User.find({ businessIds: businessId }).sort({ role: 1, name: 1 });
  return res.json({
    success: true,
    data: {
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    },
  });
}
