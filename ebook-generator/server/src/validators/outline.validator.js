import { z } from "zod";

const imageSuggestionSchema = z.object({
  imagePurpose: z.string().min(1),
  placement: z.string().min(1),
  description: z.string().min(1),
  visualStyle: z.string().min(1),
  aspectRatio: z.string().min(1),
  imagePrompt: z.string().min(1),
});

const outlineChapterSchema = z.object({
  chapterNumber: z.number().int().positive(),

  title: z.string().min(1).max(200),

  purpose: z.string().min(1),

  summary: z.string().min(1),

  learningObjectives: z.array(z.string().min(1)),

  keyTopics: z.array(z.string().min(1)),

  estimatedWordCount: z.number().int().positive(),

  imageSuggestions: z.array(imageSuggestionSchema),
});

const outlineSchema = z.object({
  chapters: z.array(outlineChapterSchema).min(1),
});

export default outlineSchema;
