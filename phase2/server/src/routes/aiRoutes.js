import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { aiRateLimit } from '../middleware/security.js'
import { generateDesign, modifyDesign, generateImage } from '../controllers/aiController.js'

const router = Router()
router.use(requireAuth)
router.post('/generate-design', aiRateLimit, generateDesign)
router.post('/modify-design', aiRateLimit, modifyDesign)
router.post('/generate-image', aiRateLimit, generateImage)
export default router
