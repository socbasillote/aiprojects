import { Asset } from '../models/Asset.js'
import { Design } from '../models/Design.js'
import { deleteObject, keyFromLocalUrl } from '../services/storage.js'

const toPublicAsset = (asset) => ({
  id: asset._id.toString(),
  type: asset.type,
  url: asset.url,
  name: asset.name,
  width: asset.width,
  height: asset.height,
  mimeType: asset.mimeType,
  size: asset.size ?? 0,
  createdAt: asset.createdAt,
})

export async function listAssets(req, res) {
  const assets = await Asset.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json({ assets: assets.map(toPublicAsset) })
}

export async function deleteAsset(req, res) {
  const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id })
  if (!asset) return res.status(404).json({ message: 'Asset not found' })

  const designs = await Design.find({ userId: req.user._id }, { document: 1 }).lean()
  const used = designs.some((design) => Object.values(design.document?.elements || {}).some((element) => element?.assetId === asset._id.toString()))
  if (used) return res.status(409).json({ message: 'This asset is used by a design. Replace or remove the image layer before deleting it.' })

  const storageKey = asset.storageKey || keyFromLocalUrl(asset.url)
  await deleteObject({ provider: asset.storageProvider, key: storageKey, url: asset.url })
  await Asset.deleteOne({ _id: asset._id })
  res.json({ ok: true })
}
