import { Router } from "express";
import { createPublicBooking, getPublicBusiness } from "../controllers/public.controller.js";

export const publicRouter = Router();
publicRouter.get("/:slug", getPublicBusiness);
publicRouter.post("/:slug/bookings", createPublicBooking);
