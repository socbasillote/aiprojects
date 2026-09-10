import type { Response } from "express";
import { Customer } from "../models/Customer.js";
import type { AuthRequest } from "../middleware/auth.js";

export async function listCustomers(req: AuthRequest, res: Response) {
  const businessId = req.businessId;
  if (!businessId) {
    return res.status(400).json({ success: false, message: "Business context is required" });
  }

  const customers = await Customer.find({ businessId }).sort({ createdAt: -1 });
  return res.json({ success: true, data: { customers } });
}
