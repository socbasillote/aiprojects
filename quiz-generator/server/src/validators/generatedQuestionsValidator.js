import { z } from "zod";

const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

const generatedQuestionSchema = z.object({
  id: z.string(),

  order: z.number().int().positive(),

  type: z.enum([
    "multiple_choice",
    "true_false",
    "short_answer",
    "essay",
    "fill_in_the_blank",
  ]),

  difficulty: z.enum(["easy", "medium", "hard"]),

  content: z.string(),

  options: z.array(optionSchema).default([]),

  answer: z.string().default(""),

  explanation: z.string().default(""),

  points: z.number().min(0).default(1),
});

export const generatedQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});
