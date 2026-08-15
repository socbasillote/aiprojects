import { z } from 'zod'
import { OpenAIProvider } from '../services/ai/OpenAIProvider.js'
import { designDocumentSchema } from '../schemas/aiSchemas.js'
import { aiOperationsResponseSchema } from '../schemas/aiOperationSchemas.js'
import { env } from '../config/env.js'
import { OpenAIAssetProvider } from '../services/ai/OpenAIAssetProvider.js'
import { Asset } from '../models/Asset.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const generateSchema = z.object({
  prompt: z.string().trim().min(3).max(4000),
  canvas: z.object({ width: z.number().int().min(1).max(10000), height: z.number().int().min(1).max(10000) }).optional(),
})


const generateImageSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  size: z.enum(['1024x1024', '1024x1536', '1536x1024']).default('1024x1024'),
  quality: z.enum(['low', 'medium', 'high']).default('low'),
})

const uploadRoot = path.resolve(process.cwd(), 'uploads')

const modifySchema = z.object({
  instruction: z.string().trim().min(2).max(2000),
  selectedIds: z.array(z.string().min(1)).max(50).default([]),
  design: designDocumentSchema,
})

function clone(value) {
  return structuredClone(value)
}

function applyOperation(document, operation) {
  const next = clone(document)
  const has = (id) => Boolean(next.elements[id])

  switch (operation.action) {
    case 'add':
      if (has(operation.element.id)) throw new Error(`Cannot add element ${operation.element.id}: ID already exists`)
      next.elements[operation.element.id] = operation.element
      next.elementOrder.push(operation.element.id)
      break
    case 'update':
      if (!has(operation.elementId)) throw new Error(`Unknown element ID: ${operation.elementId}`)
      Object.assign(next.elements[operation.elementId], operation.changes)
      break
    case 'delete':
      if (!has(operation.elementId)) throw new Error(`Unknown element ID: ${operation.elementId}`)
      delete next.elements[operation.elementId]
      next.elementOrder = next.elementOrder.filter((id) => id !== operation.elementId)
      for (const element of Object.values(next.elements)) {
        if (element.type === 'group' && Array.isArray(element.children)) element.children = element.children.filter((id) => id !== operation.elementId)
      }
      break
    case 'move':
      if (!has(operation.elementId)) throw new Error(`Unknown element ID: ${operation.elementId}`)
      next.elements[operation.elementId].x = operation.x
      next.elements[operation.elementId].y = operation.y
      break
    case 'duplicate': {
      if (!has(operation.elementId)) throw new Error(`Unknown element ID: ${operation.elementId}`)
      if (has(operation.newElementId)) throw new Error(`Duplicate target ID already exists: ${operation.newElementId}`)
      const source = next.elements[operation.elementId]
      next.elements[operation.newElementId] = { ...clone(source), ...operation.changes, id: operation.newElementId, x: (source.x || 0) + 24, y: (source.y || 0) + 24 }
      const index = next.elementOrder.indexOf(operation.elementId)
      next.elementOrder.splice(index + 1, 0, operation.newElementId)
      break
    }
    case 'group': {
      if (has(operation.groupId)) throw new Error(`Group ID already exists: ${operation.groupId}`)
      const ids = [...new Set(operation.elementIds)]
      if (ids.length < 2 || ids.some((id) => !has(id))) throw new Error('Group contains invalid element IDs')
      const group = { id: operation.groupId, type: 'group', name: operation.name || 'Group', x: 0, y: 0, rotation: 0, opacity: 1, visible: true, locked: false, children: ids }
      next.elements[operation.groupId] = group
      const firstIndex = next.elementOrder.indexOf(ids[0])
      next.elementOrder.splice(Math.max(firstIndex, 0), 0, operation.groupId)
      break
    }
    case 'ungroup': {
      const group = next.elements[operation.groupId]
      if (!group || group.type !== 'group') throw new Error(`Unknown group ID: ${operation.groupId}`)
      delete next.elements[operation.groupId]
      next.elementOrder = next.elementOrder.filter((id) => id !== operation.groupId)
      break
    }
    case 'reorder': {
      if (!has(operation.elementId)) throw new Error(`Unknown element ID: ${operation.elementId}`)
      const order = next.elementOrder.filter((id) => id !== operation.elementId)
      const target = Math.min(Math.max(operation.toIndex, 0), order.length)
      order.splice(target, 0, operation.elementId)
      next.elementOrder = order
      break
    }
    default:
      throw new Error(`Unsupported operation: ${operation.action}`)
  }

  return next
}

export async function generateDesign(req, res) {
  if (!env.openaiApiKey) return res.status(503).json({ message: 'AI generation is not configured. Add OPENAI_API_KEY to the server environment.' })
  const input = generateSchema.parse(req.body)
  const provider = new OpenAIProvider({ apiKey: env.openaiApiKey, model: env.openaiModel })
  const document = await provider.generateDesign(input.prompt, input.canvas || {})
  designDocumentSchema.parse(document)
  res.json({ document })
}

export async function generateImage(req, res) {
  if (!env.openaiApiKey) return res.status(503).json({ message: 'AI image generation is not configured. Add OPENAI_API_KEY to the server environment.' })
  const input = generateImageSchema.parse(req.body)
  const provider = new OpenAIAssetProvider({ apiKey: env.openaiApiKey, model: env.openaiImageModel })
  const generated = await provider.generateImage(input.prompt, { size: input.size, quality: input.quality })

  const userDir = path.join(uploadRoot, req.user._id.toString())
  await fs.mkdir(userDir, { recursive: true })
  const filename = `${randomUUID()}.png`
  const destination = path.join(userDir, filename)
  await fs.writeFile(destination, generated.buffer)

  const asset = await Asset.create({
    userId: req.user._id,
    type: 'image',
    url: `/uploads/${req.user._id}/${filename}`,
    name: `AI image - ${new Date().toISOString().slice(0, 10)}`,
    width: generated.width,
    height: generated.height,
    mimeType: generated.mimeType,
    size: generated.buffer.length,
  })

  res.status(201).json({
    asset: {
      id: asset._id.toString(), type: asset.type, name: asset.name, mimeType: asset.mimeType,
      size: asset.size, width: asset.width, height: asset.height, url: asset.url, createdAt: asset.createdAt,
    },
  })
}

export async function modifyDesign(req, res) {
  if (!env.openaiApiKey) return res.status(503).json({ message: 'AI generation is not configured. Add OPENAI_API_KEY to the server environment.' })
  const input = modifySchema.parse(req.body)
  const provider = new OpenAIProvider({ apiKey: env.openaiApiKey, model: env.openaiModel })
  const result = await provider.modifyDesign(input.instruction, { design: input.design, selectedIds: input.selectedIds })

  let simulated = clone(input.design)
  try {
    for (const operation of result.operations) simulated = applyOperation(simulated, operation)
    designDocumentSchema.parse(simulated)
  } catch (error) {
    return res.status(422).json({ message: `AI operations were rejected: ${error.message}` })
  }

  aiOperationsResponseSchema.parse(result)
  res.json(result)
}
