import { z } from 'zod'

const nullable = (schema) => schema.nullable()

const changeFields = {
  name: nullable(z.string().trim().max(120)),
  x: nullable(z.number().finite()),
  y: nullable(z.number().finite()),
  width: nullable(z.number().finite().positive()),
  height: nullable(z.number().finite().positive()),
  rotation: nullable(z.number().finite()),
  opacity: nullable(z.number().min(0).max(1)),
  visible: nullable(z.boolean()),
  locked: nullable(z.boolean()),
  text: nullable(z.string().max(2000)),
  fontFamily: nullable(z.string().min(1).max(100)),
  fontSize: nullable(z.number().positive().max(500)),
  fontWeight: nullable(z.number().min(100).max(900)),
  fill: nullable(z.string().trim().min(1).max(100)),
  align: nullable(z.enum(['left', 'center', 'right'])),
  lineHeight: nullable(z.number().positive()),
  letterSpacing: nullable(z.number().finite()),
  stroke: nullable(z.string().trim().min(1).max(100)),
  strokeWidth: nullable(z.number().min(0).max(100)),
  cornerRadius: nullable(z.number().min(0)),
  points: nullable(z.array(z.number().finite()).min(4)),
  src: nullable(z.string().min(1)),
  crop: nullable(z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive() })),
}

export const elementChangesSchema = z.object(changeFields).strict()

const elementForAddSchema = z.object({
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
  text: z.string().max(2000).optional(),
  fontFamily: z.string().min(1).max(100).optional(),
  fontSize: z.number().positive().max(500).optional(),
  fontWeight: z.number().min(100).max(900).optional(),
  fill: z.string().trim().min(1).max(100).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  lineHeight: z.number().positive().optional(),
  letterSpacing: z.number().finite().optional(),
  stroke: z.string().trim().min(1).max(100).optional(),
  strokeWidth: z.number().min(0).max(100).optional(),
  cornerRadius: z.number().min(0).optional(),
  points: z.array(z.number().finite()).min(4).optional(),
  src: z.string().min(1).optional(),
  crop: z.object({ x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive() }).optional(),
  children: z.array(z.string().min(1)).optional(),
}).strict()

export const aiOperationSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add'), element: elementForAddSchema }),
  z.object({ action: z.literal('update'), elementId: z.string().min(1), changes: elementChangesSchema }),
  z.object({ action: z.literal('delete'), elementId: z.string().min(1) }),
  z.object({ action: z.literal('move'), elementId: z.string().min(1), x: z.number().finite(), y: z.number().finite() }),
  z.object({ action: z.literal('duplicate'), elementId: z.string().min(1), newElementId: z.string().min(1).max(100), changes: elementChangesSchema.optional() }),
  z.object({ action: z.literal('group'), groupId: z.string().min(1).max(100), elementIds: z.array(z.string().min(1)).min(2), name: z.string().trim().max(120).optional() }),
  z.object({ action: z.literal('ungroup'), groupId: z.string().min(1) }),
  z.object({ action: z.literal('reorder'), elementId: z.string().min(1), toIndex: z.number().int().min(0) }),
])

export const aiOperationsResponseSchema = z.object({
  operations: z.array(aiOperationSchema).max(50),
  summary: z.string().trim().max(500).default('Design updated.'),
})
