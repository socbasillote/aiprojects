import { z } from "zod";

const chapterSchema = z.object({
  chapterNumber: z.coerce.number().int().positive(),

  title: z.string().min(1).max(300),

  summary: z.string().default(""),

  content: z.string().min(1),

  wordCount: z.coerce.number().int().nonnegative(),
});

export default chapterSchema;
