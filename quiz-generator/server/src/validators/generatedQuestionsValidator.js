import { z } from "zod";

const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

const assetSchema = z.object({
  id: z.string(),
  type: z.string().default("image"),
  source: z
    .enum(["generated", "selected", "uploaded", "url"])
    .default("generated"),
  url: z.string().default(""),
  prompt: z.string().default(""),
  altText: z.string().default(""),
  validation: z.record(z.string(), z.unknown()).nullable().default(null),
});

const mathSchema = z.object({
  expression: z.string().default(""),
  solution: z.string().default(""),
  unit: z.string().default(""),
  tolerance: z.number().min(0).default(0),
  solutionLayout: z
    .enum(["top_to_bottom", "horizontal"])
    .default("top_to_bottom"),
  verified: z.boolean().default(false),
  verification: z.record(z.string(), z.unknown()).nullable().default(null),
});

const generatedQuestionSchema = z.object({
  id: z.string(),

  subject: z.string().default(""),

  order: z.number().int().positive(),

  type: z.enum([
    "multiple_choice",
    "true_false",
    "short_answer",
    "essay",
    "fill_in_the_blank",
  ]),

  contentType: z.enum(["text", "math", "visual"]).default("text"),

  contentKind: z.enum(["text", "math", "visual"]).default("text"),

  difficulty: z.enum(["easy", "medium", "hard"]),

  content: z.string(),

  options: z.array(optionSchema).default([]),

  answer: z.string().default(""),

  explanation: z.string().default(""),

  points: z.number().min(0).default(1),

  math: mathSchema.nullable().default(null),

  assets: z.array(assetSchema).default([]),
});

export const generatedQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});
