import path from 'node:path'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import { Asset } from '../models/Asset.js'
import { sanitizeSvg } from '../utils/sanitizeSvg.js'

const uploadRoot = path.resolve(process.cwd(), 'uploads')

export async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Image file is required' })

  const width = Number(req.body.width)
  const height = Number(req.body.height)
  if (!Number.isFinite(width) || width < 1 || !Number.isFinite(height) || height < 1) {
    return res.status(400).json({ message: 'Valid image width and height are required' })
  }

  const userDir = path.join(uploadRoot, req.user._id.toString())
  await fs.mkdir(userDir, { recursive: true })

  const isSvg = req.file.mimetype === 'image/svg+xml' || path.extname(req.file.originalname).toLowerCase() === '.svg'
  const extension = isSvg ? '.svg' : (path.extname(req.file.originalname).toLowerCase() || '.bin')
  const filename = `${randomUUID()}${extension}`
  const destination = path.join(userDir, filename)

  if (isSvg) {
    const source = await fs.readFile(req.file.path, 'utf8')
    const sanitized = sanitizeSvg(source)
    await fs.writeFile(destination, sanitized, 'utf8')
    await fs.unlink(req.file.path).catch(() => {})
  } else {
    await fs.rename(req.file.path, destination)
  }

  const url = `/uploads/${req.user._id}/${filename}`
  const asset = await Asset.create({
    userId: req.user._id,
    type: isSvg ? 'svg' : 'image',
    url,
    name: req.file.originalname,
    width: Math.round(width),
    height: Math.round(height),
    mimeType: isSvg ? 'image/svg+xml' : req.file.mimetype,
    size: req.file.size,
  })

  res.status(201).json({ asset: {
    id: asset._id.toString(),
    type: asset.type,
    name: asset.name,
    mimeType: asset.mimeType,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    url: asset.url,
    createdAt: asset.createdAt,
  } })
}
