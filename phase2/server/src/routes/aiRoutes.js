import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { generateDesign, modifyDesign, generateImage } from '../controllers/aiController.js'

const router = Router()
router.use(requireAuth)
router.post('/generate-design', generateDesign)
router.post('/modify-design', modifyDesign)
router.post('/generate-image', generateImage)
export default router
