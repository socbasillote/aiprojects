import { z } from "zod";

const specificationSchema = z.object({
  title: z.string().min(1).max(200),

  subtitle: z.string().max(300).default(""),

  targetAudience: z.string().min(1).max(1000),

  objective: z.string().min(1).max(2000),

  contentType: z
    .enum([
      "Fiction",
      "Children's Books",
      "Non-Fiction",
      "Specialized / Lifestyle",
      "Professional & Practical",
    ])
    .default("Non-Fiction"),

  tone: z.string().min(1).max(200),

  writingStyle: z.string().min(1).max(500),

  difficultyLevel: z.string().min(1).max(100),

  language: z.string().min(1).max(100),

  estimatedWordCount: z.coerce.number().int().positive(),

  estimatedPageCount: z.coerce.number().int().positive(),

  chapterCount: z.coerce.number().int().positive().max(100),

  themes: z.array(z.string()).default([]),

  requiredTopics: z.array(z.string()).default([]),

  excludedTopics: z.array(z.string()).default([]),

  structuralRequirements: z.array(z.string()).default([]),

  formattingRequirements: z.array(z.string()).default([]),

  imageRequirements: z.array(z.string()).default([]),
});

export default specificationSchema;
