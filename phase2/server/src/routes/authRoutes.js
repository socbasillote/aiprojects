import { Router } from 'express'
import { login, me, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { authRateLimit } from '../middleware/security.js'
import { logout } from '../controllers/authController.js'

const router = Router()
router.post('/register', authRateLimit, register)
router.post('/login', authRateLimit, login)
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, me)
export default router
