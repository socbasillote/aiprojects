import mongoose from 'mongoose'

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  width: { type: Number, required: true, min: 1, max: 10000 },
  height: { type: Number, required: true, min: 1, max: 10000 },
  document: { type: mongoose.Schema.Types.Mixed, required: true },
  thumbnail: { type: String, default: null },
}, { timestamps: true })

designSchema.index({ userId: 1, updatedAt: -1 })

export const Design = mongoose.model('Design', designSchema)
