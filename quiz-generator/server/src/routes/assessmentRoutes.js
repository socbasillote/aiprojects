import express from "express";

import {
  createAssessment,
  listAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  generateQuestions,
} from "../controllers/assessmentController.js";

const router = express.Router();

router.post("/", createAssessment);

router.get("/", listAssessments);

router.post("/:assessmentId/generate", generateQuestions);

router.get("/:assessmentId", getAssessment);

router.patch("/:assessmentId", updateAssessment);

router.delete("/:assessmentId", deleteAssessment);

export default router;
