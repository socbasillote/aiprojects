import { User } from '../models/User.js'

export const AI_CREDIT_COSTS = Object.freeze({
  generateDesign: 1,
  modifyDesign: 1,
  generateImage: 5,
})

export async function ensureAiCredits(user) {
  if (typeof user.aiCredits === 'number') return user
  user.aiCredits = 20
  await user.save()
  return user
}

export async function reserveAiCredits(userId, amount) {
  const user = await User.findOneAndUpdate(
    { _id: userId, aiCredits: { $gte: amount } },
    { $inc: { aiCredits: -amount } },
    { new: true }
  )
  if (!user) {
    const current = await User.findById(userId).select('aiCredits')
    const remaining = typeof current?.aiCredits === 'number' ? current.aiCredits : 0
    const error = new Error(`Not enough AI credits. You need ${amount} credit${amount === 1 ? '' : 's'}, but have ${remaining}.`)
    error.status = 402
    error.code = 'INSUFFICIENT_AI_CREDITS'
    error.remaining = remaining
    throw error
  }
  return user.aiCredits
}

export async function refundAiCredits(userId, amount) {
  const user = await User.findByIdAndUpdate(userId, { $inc: { aiCredits: amount } }, { new: true }).select('aiCredits')
  return user?.aiCredits ?? 0
}

export async function getAiCredits(userId) {
  const user = await User.findById(userId).select('aiCredits')
  return typeof user?.aiCredits === 'number' ? user.aiCredits : 0
}
