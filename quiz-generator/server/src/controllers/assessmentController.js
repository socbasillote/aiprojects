import crypto from "node:crypto";
import Assessment from "../models/Assessment.js";

import { assessmentGenerationSchema } from "../validators/assessmentGenerationValidator.js";
import { validateGeneratedQuestions } from "../validators/aiQualityValidator.js";

import {
  generateAssessmentQuestions,
  regenerateAssessmentQuestion,
} from "../services/ai/generateAssessmentQuestions.js";

/*
 * ---------------------------------------------
 * CREATE
 * ---------------------------------------------
 */

export async function createAssessment(req, res, next) {
  try {
    const { title, questions, sections, paper } = req.body;

    const assessment = await Assessment.create({
      title,
      questions,
      sections,
      paper,
    });

    res.status(201).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

/*
 * ---------------------------------------------
 * LIST
 * ---------------------------------------------
 */

export async function listAssessments(req, res, next) {
  try {
    const assessments = await Assessment.find().sort({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
}

/*
 * ---------------------------------------------
 * GET ONE
 * ---------------------------------------------
 */

export async function getAssessment(req, res, next) {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId).lean();

    if (!assessment) {
      const error = new Error("Assessment not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

/*
 * ---------------------------------------------
 * UPDATE
 * ---------------------------------------------
 */

export async function updateAssessment(req, res, next) {
  try {
    const { assessmentId } = req.params;

    const { title, questions, sections, paper } = req.body;

    const assessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      {
        title,
        questions,
        sections,
        paper,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!assessment) {
      const error = new Error("Assessment not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

/*
 * ---------------------------------------------
 * DELETE
 * ---------------------------------------------
 */

export async function deleteAssessment(req, res, next) {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findByIdAndDelete(assessmentId).lean();

    if (!assessment) {
      const error = new Error("Assessment not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function generateQuestions(req, res, next) {
  try {
    const { assessmentId } = req.params;

    const validation = assessmentGenerationSchema.safeParse(req.body);

    if (!validation.success) {
      const error = new Error("Invalid assessment generation request.");

      error.statusCode = 400;

      error.details = validation.error.flatten();

      throw error;
    }

    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      const error = new Error("Assessment not found.");

      error.statusCode = 404;

      throw error;
    }

    const questions = await generateAssessmentQuestions(validation.data);

    const qualityCheck = validateGeneratedQuestions(
      questions,
      validation.data.difficulty,
    );

    if (!qualityCheck.valid) {
      const error = new Error("Generated questions failed the AI quality check.");
      error.statusCode = 422;
      error.details = qualityCheck;
      throw error;
    }

    assessment.questions = questions;

    /*
     * Keep the existing sections if they exist.
     *
     * For a new assessment with no sections,
     * create one section containing all generated
     * questions.
     */
    if (assessment.sections.length === 0) {
      assessment.sections = [
        {
          id: crypto.randomUUID(),
          title: "Questions",
          instructions: "",
          questionIds: questions.map((question) => question.id),
        },
      ];
    } else {
      assessment.sections.forEach((section) => {
        section.questionIds = section.questionIds.filter((questionId) =>
          questions.some((question) => question.id === questionId),
        );
      });
    }

    await assessment.save();

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

export async function regenerateQuestion(req, res, next) {
  try {
    const { assessmentId, questionId } = req.params;
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      const error = new Error("Assessment not found.");
      error.statusCode = 404;
      throw error;
    }

    const questionIndex = assessment.questions.findIndex(
      (question) => question.id === questionId,
    );

    if (questionIndex === -1) {
      const error = new Error("Question not found.");
      error.statusCode = 404;
      throw error;
    }

    const sourceQuestion = req.body?.question || assessment.questions[questionIndex];
    const replacement = await regenerateAssessmentQuestion(sourceQuestion);
    const qualityCheck = validateGeneratedQuestions(
      [replacement],
      sourceQuestion.difficulty,
    );

    if (!qualityCheck.valid) {
      const error = new Error("Regenerated question failed the AI quality check.");
      error.statusCode = 422;
      error.details = qualityCheck;
      throw error;
    }

    assessment.questions[questionIndex] = replacement;
    await assessment.save();

    res.status(200).json({
      success: true,
      data: replacement,
    });
  } catch (error) {
    next(error);
  }
}
