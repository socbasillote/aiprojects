import { z } from "zod";

const questionTypes = [
  "multiple_choice",
  "true_false",
  "short_answer",
  "essay",
  "fill_in_the_blank",
];

export const assessmentGenerationSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required.").max(100),

  gradeLevel: z.string().trim().min(1, "Grade level is required.").max(50),

  topic: z.string().trim().min(1, "Topic is required.").max(200),

  questionCount: z.number().int().min(1).max(100),

  questionTypes: z
    .array(z.enum(questionTypes))
    .min(1, "At least one question type is required."),

  difficulty: z.enum(["easy", "medium", "hard"]),

  language: z.string().trim().min(1).max(50),

  instructions: z.string().trim().max(2000).default(""),
});
