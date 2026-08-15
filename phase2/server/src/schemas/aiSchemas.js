import { z } from 'zod'

const colorSchema = z.string().trim().min(1).max(100)

const base = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().max(120).optional(),
  type: z.enum(['text', 'rect', 'circle', 'ellipse', 'line', 'image', 'svg', 'group']),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().optional(),
  height: z.number().finite().optional(),
  rotation: z.number().finite().optional(),
  opacity: z.number().min(0).max(1).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
})

const text = base.extend({
  type: z.literal('text'),
  text: z.string().max(2000),
  fontFamily: z.string().min(1).max(100),
  fontSize: z.number().positive().max(500),
  fontWeight: z.number().min(100).max(900).optional(),
  fill: colorSchema,
  align: z.enum(['left', 'center', 'right']).optional(),
  lineHeight: z.number().positive().optional(),
  letterSpacing: z.number().finite().optional(),
})

const rect = base.extend({
  type: z.literal('rect'),
  fill: colorSchema,
  stroke: colorSchema.optional(),
  strokeWidth: z.number().min(0).max(100).optional(),
  cornerRadius: z.number().min(0).optional(),
})

const circle = base.extend({ type: z.literal('circle'), fill: colorSchema, stroke: colorSchema.optional(), strokeWidth: z.number().min(0).optional() })
const ellipse = circle.extend({ type: z.literal('ellipse') })
const line = base.extend({ type: z.literal('line'), points: z.array(z.number()).min(4), stroke: colorSchema, strokeWidth: z.number().positive() })
const image = base.extend({ type: z.literal('image'), src: z.string().min(1), crop: z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive() }).optional() })
const svg = base.extend({ type: z.literal('svg'), src: z.string().min(1) })
const group = base.extend({ type: z.literal('group'), children: z.array(z.string().min(1)) })

export const elementSchema = z.discriminatedUnion('type', [text, rect, circle, ellipse, line, image, svg, group])

export const designDocumentSchema = z.object({
  version: z.number().int().positive(),
  canvas: z.object({
    width: z.number().int().min(1).max(10000),
    height: z.number().int().min(1).max(10000),
    background: colorSchema,
  }),
  elements: z.record(z.string(), elementSchema),
  elementOrder: z.array(z.string()),
}).superRefine((doc, ctx) => {
  const ids = new Set(Object.keys(doc.elements))
  if (doc.elementOrder.length !== ids.size) {
    ctx.addIssue({ code: 'custom', path: ['elementOrder'], message: 'elementOrder must contain every element exactly once' })
    return
  }
  for (const id of doc.elementOrder) {
    if (!ids.has(id)) ctx.addIssue({ code: 'custom', path: ['elementOrder'], message: `Unknown element ID: ${id}` })
  }
})
