import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { billingRateLimit } from '../middleware/security.js'
import { getPackages, getCredits, createOrder, captureOrder } from '../controllers/billingController.js'

const router = Router()
router.use(requireAuth)
router.get('/packages', getPackages)
router.get('/credits', getCredits)
router.post('/paypal/create-order', billingRateLimit, createOrder)
router.post('/paypal/capture-order', billingRateLimit, captureOrder)
export default router
