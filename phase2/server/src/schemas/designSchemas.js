import { z } from "zod";
import { designDocumentSchema } from "./aiSchemas.js";

export const createDesignSchema = z
  .object({
    name: z.string().trim().min(1).max(120).default("Untitled design"),

    document: designDocumentSchema,

    thumbnail: z.string().max(500_000).nullable().optional(),
  })
  .strict();

export const updateDesignSchema = createDesignSchema
  .partial()
  .extend({
    name: z.string().trim().min(1).max(120).optional(),
  })
  .strict();
