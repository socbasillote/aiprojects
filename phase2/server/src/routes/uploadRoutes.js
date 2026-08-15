import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { requireAuth } from '../middleware/auth.js'
import { uploadImage } from '../controllers/uploadController.js'

const router = express.Router()
const tempDir = path.resolve(process.cwd(), 'uploads', '.tmp')
fs.mkdirSync(tempDir, { recursive: true })

const upload = multer({
  dest: tempDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'))
    cb(null, true)
  },
})

router.post('/image', requireAuth, upload.single('file'), uploadImage)

export default router
