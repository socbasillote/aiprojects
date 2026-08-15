import OpenAI from 'openai'
import { AIProvider } from './AIProvider.js'
import { DESIGN_SYSTEM_PROMPT, DESIGN_MODIFICATION_SYSTEM_PROMPT } from './prompts.js'
import { designDocumentSchema } from '../../schemas/aiSchemas.js'
import { aiOperationsResponseSchema } from '../../schemas/aiOperationSchemas.js'

const nullable = (type) => ({ anyOf: [type, { type: 'null' }] })

const elementProperties = {
  id: { type: 'string' },
  name: nullable({ type: 'string', maxLength: 120 }),
  type: { type: 'string', enum: ['text', 'rect', 'circle', 'ellipse', 'line', 'image', 'svg', 'group'] },
  x: { type: 'number' },
  y: { type: 'number' },
  width: nullable({ type: 'number' }),
  height: nullable({ type: 'number' }),
  rotation: nullable({ type: 'number' }),
  opacity: nullable({ type: 'number' }),
  visible: nullable({ type: 'boolean' }),
  locked: nullable({ type: 'boolean' }),
  text: nullable({ type: 'string', maxLength: 2000 }),
  fontFamily: nullable({ type: 'string', maxLength: 100 }),
  fontSize: nullable({ type: 'number' }),
  fontWeight: nullable({ type: 'number' }),
  fill: nullable({ type: 'string', maxLength: 100 }),
  align: nullable({ type: 'string', enum: ['left', 'center', 'right'] }),
  lineHeight: nullable({ type: 'number' }),
  letterSpacing: nullable({ type: 'number' }),
  stroke: nullable({ type: 'string', maxLength: 100 }),
  strokeWidth: nullable({ type: 'number' }),
  cornerRadius: nullable({ type: 'number' }),
  points: nullable({ type: 'array', items: { type: 'number' } }),
  src: nullable({ type: 'string' }),
  crop: nullable({
    type: 'object',
    additionalProperties: false,
    properties: { x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } },
    required: ['x', 'y', 'width', 'height'],
  }),
  children: nullable({ type: 'array', items: { type: 'string' } }),
}

const designJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    version: { type: 'integer' },
    canvas: {
      type: 'object', additionalProperties: false,
      properties: { width: { type: 'integer' }, height: { type: 'integer' }, background: { type: 'string', maxLength: 100 } },
      required: ['width', 'height', 'background'],
    },
    elements: { type: 'array', items: { type: 'object', additionalProperties: false, properties: elementProperties, required: Object.keys(elementProperties) } },
    elementOrder: { type: 'array', items: { type: 'string' } },
  },
  required: ['version', 'canvas', 'elements', 'elementOrder'],
}

const changesJsonSchema = {
  type: 'object', additionalProperties: false,
  properties: Object.fromEntries(Object.entries(elementProperties).filter(([key]) => !['id', 'type', 'children'].includes(key)).map(([key, schema]) => [key, schema])),
  required: Object.keys(elementProperties).filter((key) => !['id', 'type', 'children'].includes(key)),
}

const operationJsonSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    action: { type: 'string', enum: ['add', 'update', 'delete', 'move', 'duplicate', 'group', 'ungroup', 'reorder'] },
    element: nullable({ type: 'object', additionalProperties: false, properties: elementProperties, required: Object.keys(elementProperties) }),
    elementId: nullable({ type: 'string' }),
    changes: nullable(changesJsonSchema),
    x: nullable({ type: 'number' }),
    y: nullable({ type: 'number' }),
    newElementId: nullable({ type: 'string' }),
    groupId: nullable({ type: 'string' }),
    elementIds: nullable({ type: 'array', items: { type: 'string' } }),
    name: nullable({ type: 'string', maxLength: 120 }),
    toIndex: nullable({ type: 'integer' }),
  },
  required: ['action', 'element', 'elementId', 'changes', 'x', 'y', 'newElementId', 'groupId', 'elementIds', 'name', 'toIndex'],
}

const operationsJsonSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    operations: { type: 'array', maxItems: 50, items: operationJsonSchema },
    summary: { type: 'string', maxLength: 500 },
  },
  required: ['operations', 'summary'],
}

function normalizeDocument(document) {
  const elements = {}
  for (const raw of document.elements) {
    const element = Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== null))
    elements[element.id] = element
  }
  return { ...document, elements }
}

function compactDesign(document) {
  return {
    version: document.version,
    canvas: document.canvas,
    elementOrder: document.elementOrder,
    elements: document.elementOrder.map((id) => {
      const element = document.elements[id]
      if (!element) return null
      const copy = { ...element }
      if (copy.type === 'image' || copy.type === 'svg') delete copy.src
      return copy
    }).filter(Boolean),
  }
}

export class OpenAIProvider extends AIProvider {
  constructor({ apiKey, model = 'gpt-5.5' } = {}) {
    super()
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async generateDesign(prompt, { width = 1080, height = 1080 } = {}) {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: `${DESIGN_SYSTEM_PROMPT}\nThe application canvas is ${width} by ${height} pixels.`,
      input: prompt,
      text: { format: { type: 'json_schema', name: 'design_document', strict: true, schema: designJsonSchema } },
    })
    const raw = response.output_text
    let parsed
    try { parsed = JSON.parse(raw) } catch { throw new Error('AI returned invalid JSON') }
    const normalized = normalizeDocument(parsed)
    const validated = designDocumentSchema.safeParse(normalized)
    if (!validated.success) {
      const issue = validated.error.issues[0]
      const path = issue?.path?.length ? issue.path.join('.') : 'design'
      throw new Error(`AI returned an invalid design at ${path}: ${issue?.message || 'schema validation failed'}`)
    }
    return validated.data
  }

  async modifyDesign(instruction, { design, selectedIds = [] } = {}) {
    const compact = compactDesign(design)
    const selection = selectedIds.filter((id) => Boolean(design.elements[id]))
    const input = JSON.stringify({ instruction, selectedIds: selection, design: compact })
    const response = await this.client.responses.create({
      model: this.model,
      instructions: DESIGN_MODIFICATION_SYSTEM_PROMPT,
      input,
      text: { format: { type: 'json_schema', name: 'design_operations', strict: true, schema: operationsJsonSchema } },
    })
    let parsed
    try { parsed = JSON.parse(response.output_text) } catch { throw new Error('AI returned invalid JSON') }
    const validated = aiOperationsResponseSchema.safeParse(parsed)
    if (!validated.success) {
      const issue = validated.error.issues[0]
      const path = issue?.path?.length ? issue.path.join('.') : 'operations'
      throw new Error(`AI returned invalid operations at ${path}: ${issue?.message || 'schema validation failed'}`)
    }
    return validated.data
  }
}
