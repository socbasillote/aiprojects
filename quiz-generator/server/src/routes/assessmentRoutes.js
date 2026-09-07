import express from "express";

import {
  createAssessment,
  listAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  generateQuestions,
  regenerateQuestion,
  generateQuestionPreview,
} from "../controllers/assessmentController.js";

const router = express.Router();

router.post("/", createAssessment);

router.get("/", listAssessments);

router.post("/:assessmentId/generate", generateQuestions);

router.post("/:assessmentId/generate-preview", generateQuestionPreview);

router.post(
  "/:assessmentId/questions/:questionId/regenerate",
  regenerateQuestion,
);

router.get("/:assessmentId", getAssessment);

router.patch("/:assessmentId", updateAssessment);

router.delete("/:assessmentId", deleteAssessment);

export default router;
