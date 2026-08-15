import mongoose from 'mongoose'
import { Design } from '../models/Design.js'
import { createDesignSchema, updateDesignSchema } from '../schemas/designSchemas.js'
import { normalizeDesignDocument } from '../utils/normalizeDesign.js'

function validId(id) {
  return mongoose.isValidObjectId(id)
}

function serialize(design) {
  return {
    id: design._id.toString(),
    name: design.name,
    width: design.width,
    height: design.height,
    document: design.document,
    thumbnail: design.thumbnail,
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
  }
}

export async function listDesigns(req, res) {
  const designs = await Design.find({ userId: req.user._id }).sort({ updatedAt: -1 })
  res.json({ designs: designs.map(serialize) })
}

export async function createDesign(req, res) {
  const input = createDesignSchema.parse({ ...req.body, document: normalizeDesignDocument(req.body?.document) })
  const design = await Design.create({
    userId: req.user._id,
    name: input.name,
    width: input.document.canvas.width,
    height: input.document.canvas.height,
    document: input.document,
    thumbnail: input.thumbnail || null,
  })
  res.status(201).json({ design: serialize(design) })
}

export async function getDesign(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid design id' })
  const design = await Design.findOne({ _id: req.params.id, userId: req.user._id })
  if (!design) return res.status(404).json({ message: 'Design not found' })
  res.json({ design: serialize(design) })
}

export async function updateDesign(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid design id' })
  const input = updateDesignSchema.parse({ ...req.body, ...(req.body?.document !== undefined ? { document: normalizeDesignDocument(req.body.document) } : {}) })
  const update = {}
  if (input.name !== undefined) update.name = input.name
  if (input.document !== undefined) {
    update.document = input.document
    update.width = input.document.canvas.width
    update.height = input.document.canvas.height
  }
  if (input.thumbnail !== undefined) update.thumbnail = input.thumbnail
  const design = await Design.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, update, { new: true, runValidators: true })
  if (!design) return res.status(404).json({ message: 'Design not found' })
  res.json({ design: serialize(design) })
}

export async function deleteDesign(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid design id' })
  const result = await Design.deleteOne({ _id: req.params.id, userId: req.user._id })
  if (!result.deletedCount) return res.status(404).json({ message: 'Design not found' })
  res.status(204).end()
}
