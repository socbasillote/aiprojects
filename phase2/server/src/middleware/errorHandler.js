import { ZodError } from 'zod'
import mongoose from 'mongoose'

export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' })
}

export function errorHandler(error, req, res, next) {
  console.error(error)
  if (res.headersSent) return next(error)

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Invalid request data',
      code: 'VALIDATION_ERROR',
      issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    })
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: 'Invalid data supplied', code: 'VALIDATION_ERROR' })
  }
  if (error?.code === 11000) return res.status(409).json({ message: 'A record with that value already exists.', code: 'DUPLICATE_RESOURCE' })
  if (error?.name === 'MulterError') return res.status(400).json({ message: error.message, code: error.code || 'UPLOAD_ERROR' })

  const status = Number.isInteger(error?.status) ? error.status : 500
  const safeMessage = status >= 500 ? 'Internal server error' : (error.message || 'Request failed')
  return res.status(status).json({
    message: safeMessage,
    ...(error?.code ? { code: error.code } : {}),
    ...(typeof error?.remaining === 'number' ? { remaining: error.remaining } : {}),
  })
}
