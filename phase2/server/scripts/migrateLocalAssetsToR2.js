import 'dotenv/config'
import path from 'node:path'
import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import { Asset } from '../src/models/Asset.js'
import { env } from '../src/config/env.js'
import { putBuffer } from '../src/services/storage.js'

if (env.storageProvider !== 'r2') {
  throw new Error('Set STORAGE_PROVIDER=r2 before running this migration.')
}

const uploadRoot = path.resolve(process.cwd(), 'uploads')
const deleteLocal = process.argv.includes('--delete-local')

await mongoose.connect(env.mongoUri)
console.log('MongoDB connected')

let migrated = 0
let skipped = 0
let missing = 0

try {
  const assets = await Asset.find({ $or: [
    { storageProvider: 'local' },
    { storageProvider: { $exists: false } },
    { storageKey: { $exists: false } },
  ] }).sort({ createdAt: 1 })

  for (const asset of assets) {
    const localKey = asset.storageKey || (asset.url?.startsWith('/uploads/') ? asset.url.slice('/uploads/'.length) : null)
    if (!localKey) {
      console.warn(`Skipping ${asset._id}: no local storage key could be derived.`)
      skipped += 1
      continue
    }

    const source = path.resolve(uploadRoot, localKey)
    if (source === uploadRoot || !source.startsWith(`${uploadRoot}${path.sep}`)) {
      console.warn(`Skipping ${asset._id}: unsafe local path.`)
      skipped += 1
      continue
    }

    let body
    try {
      body = await fs.readFile(source)
    } catch {
      console.warn(`Missing local file for ${asset._id}: ${source}`)
      missing += 1
      continue
    }

    const storageKey = `users/${asset.userId.toString()}/assets/${asset._id.toString()}${path.extname(localKey).toLowerCase() || ''}`
    const stored = await putBuffer({ key: storageKey, body, contentType: asset.mimeType })

    asset.storageProvider = stored.provider
    asset.storageKey = stored.key
    asset.url = stored.url
    await asset.save()
    migrated += 1
    console.log(`Migrated ${asset._id} → ${stored.url}`)

    if (deleteLocal) await fs.unlink(source).catch(() => {})
  }
} finally {
  await mongoose.disconnect()
}

console.log(`Migration complete. migrated=${migrated} skipped=${skipped} missing=${missing}`)
if (missing > 0) process.exitCode = 2
