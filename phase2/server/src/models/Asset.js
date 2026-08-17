import mongoose from 'mongoose'

const assetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['image', 'svg'], required: true, default: 'image' },
  storageProvider: { type: String, enum: ['local', 'r2'], default: 'local' },
  storageKey: { type: String, required: true, trim: true, maxlength: 500 },
  url: { type: String, required: true, maxlength: 2000 },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  width: { type: Number, required: true, min: 1, max: 50000 },
  height: { type: Number, required: true, min: 1, max: 50000 },
  mimeType: { type: String, required: true, maxlength: 120 },
  size: { type: Number, min: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } })

assetSchema.index({ userId: 1, createdAt: -1 })
assetSchema.index({ userId: 1, storageKey: 1 }, { unique: true })

export const Asset = mongoose.model('Asset', assetSchema)
