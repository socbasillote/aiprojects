import express from "express";
import {
  generateDesign,
  generateImage,
  modifyDesign,
  estimateAiCredits,
} from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.post("/estimate", estimateAiCredits);
router.post("/generate-design", generateDesign);
router.post("/generate-image", generateImage);
router.post("/modify-design", modifyDesign);

export default router;
