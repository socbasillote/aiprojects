import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listAssets, deleteAsset } from '../controllers/assetController.js'

const router = express.Router()
router.get('/', requireAuth, listAssets)
router.delete('/:id', requireAuth, deleteAsset)
export default router
