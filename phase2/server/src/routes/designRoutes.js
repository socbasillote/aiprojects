import { Router } from 'express'
import { createDesign, deleteDesign, getDesign, listDesigns, updateDesign } from '../controllers/designController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listDesigns)
router.post('/', createDesign)
router.get('/:id', getDesign)
router.put('/:id', updateDesign)
router.delete('/:id', deleteDesign)
export default router
