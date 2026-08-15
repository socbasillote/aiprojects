import { z } from 'zod'

const elementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'rect', 'circle', 'ellipse', 'line', 'image', 'svg', 'group']),
  name: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  rotation: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
}).passthrough()

export const designDocumentSchema = z.object({
  version: z.number().int().positive(),
  canvas: z.object({ width: z.number().positive(), height: z.number().positive(), background: z.string() }).passthrough(),
  elements: z.record(z.string(), elementSchema),
  elementOrder: z.array(z.string()),
})

export const createDesignSchema = z.object({
  name: z.string().trim().min(1).max(120).default('Untitled design'),
  document: designDocumentSchema,
  thumbnail: z.string().nullable().optional(),
})

export const updateDesignSchema = createDesignSchema.partial().extend({
  name: z.string().trim().min(1).max(120).optional(),
})
