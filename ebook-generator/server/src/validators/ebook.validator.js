import { z } from "zod";

const createEbookSchema = z.object({
  title: z.string().trim().min(1, "Ebook title is required.").max(200),

  subtitle: z.string().trim().max(300).optional().default(""),

  description: z
    .string()
    .trim()
    .min(20, "Please provide a more detailed ebook description."),

  authorName: z.string().trim().max(150).optional().default(""),

  targetAudience: z.string().trim().min(1, "Target audience is required."),

  language: z.string().trim().min(1).default("English"),

  tone: z.string().trim().min(1),

  ebookLength: z.string().trim().min(1),

  chapterCount: z.coerce.number().int().min(1).max(100),

  writingStyle: z.string().trim().min(1),

  contentType: z.string().trim().min(1),

  imageMode: z
    .enum(["none", "ai", "placeholders", "selected", "all"])
    .optional()
    .default("none"),

  imageStyle: z.string().trim().optional().default("editorial"),
});

const updateEbookSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),

    subtitle: z.string().trim().max(300).optional(),

    description: z.string().trim().min(20).optional(),

    authorName: z.string().trim().max(150).optional(),

    settings: z
      .object({
        targetAudience: z.string().trim().optional(),

        language: z.string().trim().optional(),

        tone: z.string().trim().optional(),

        ebookLength: z.string().trim().optional(),

        chapterCount: z.coerce.number().int().min(1).max(100).optional(),

        writingStyle: z.string().trim().optional(),

        contentType: z.string().trim().optional(),

        imageMode: z
          .enum(["none", "ai", "placeholders", "selected", "all"])
          .optional(),

        imageStyle: z.string().trim().optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

export { createEbookSchema, updateEbookSchema };
