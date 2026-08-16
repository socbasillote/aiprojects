import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { getSessionToken } from '../utils/session.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const [scheme, bearerToken] = header.split(' ')
    const token = scheme === 'Bearer' && bearerToken ? bearerToken : getSessionToken(req)
    if (!token) return res.status(401).json({ message: 'Authentication required' })
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.sub).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'Invalid authentication' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
