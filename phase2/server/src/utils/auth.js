import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, { expiresIn: '7d' })
}
