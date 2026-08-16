import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['paypal'], default: 'paypal', required: true },
  paypalOrderId: { type: String, required: true, unique: true, index: true },
  paypalCaptureId: { type: String, default: null },
  packageId: { type: String, required: true },
  credits: { type: Number, required: true, min: 1 },
  amount: { type: String, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['CREATED', 'COMPLETED', 'FAILED'], default: 'CREATED', index: true },
}, { timestamps: true })

export const Payment = mongoose.model('Payment', paymentSchema)
