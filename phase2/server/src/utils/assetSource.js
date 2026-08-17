import { env } from '../config/env.js'

const localAssetPattern = /^\/uploads\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+$/

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/$/, '')
}

export function isAllowedAssetSource(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  if (localAssetPattern.test(value)) return true

  const base = normalizeBaseUrl(env.r2PublicBaseUrl)
  if (!base) return false

  return value.startsWith(`${base}/`)
}

export function assertAllowedAssetSource(value) {
  return isAllowedAssetSource(value)
}
