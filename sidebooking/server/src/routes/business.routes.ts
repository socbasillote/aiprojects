import { Router } from "express";
import { getBusiness, saveBusiness } from "../controllers/business.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const businessRouter = Router();
businessRouter.use(requireAuth);
businessRouter.get("/", getBusiness);
businessRouter.put("/", saveBusiness);
