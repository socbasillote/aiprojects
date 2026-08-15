import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { registerSchema, loginSchema } from '../schemas/authSchemas.js'
import { signToken } from '../utils/auth.js'

const publicUser = (user) => ({ id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email })

export async function register(req, res) {
  const input = registerSchema.parse(req.body)
  const existing = await User.findOne({ email: input.email.toLowerCase() })
  if (existing) return res.status(409).json({ message: 'An account with that email already exists' })
  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await User.create({ ...input, email: input.email.toLowerCase(), passwordHash })
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
}

export async function login(req, res) {
  const input = loginSchema.parse(req.body)
  const user = await User.findOne({ email: input.email.toLowerCase() })
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' })
  res.json({ token: signToken(user), user: publicUser(user) })
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) })
}
