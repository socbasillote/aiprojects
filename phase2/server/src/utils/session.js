import { env } from '../config/env.js'

const COOKIE_NAME = 'editor_session'

function cookieOptions(maxAge) {
  const parts = [
    `${COOKIE_NAME}=${maxAge ? encodeURIComponent(maxAge) : ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (env.isProduction) parts.push('Secure')
  parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge / 1000))}`)
  if (!maxAge) parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  return parts.join('; ')
}

export function setSessionCookie(res, token) {
  const parts = cookieOptions(7 * 24 * 60 * 60 * 1000).split('; ')
  parts[0] = `${COOKIE_NAME}=${encodeURIComponent(token)}`
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookieOptions(0))
}

export function getSessionToken(req) {
  const header = req.headers.cookie || ''
  const match = header.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`))
  return match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : null
}
