import { env } from '../config/env.js'
import { getPayPalBaseUrl } from '../config/paypal.js'

function assertConfigured() {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    const error = new Error('PayPal payments are not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the server environment.')
    error.status = 503
    throw error
  }
}

export async function getPayPalAccessToken() {
  assertConfigured()
  const credentials = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString('base64')
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body?.error_description || body?.message || 'PayPal authentication failed')
    error.status = 502
    throw error
  }
  return body.access_token
}

export async function createPayPalOrder({ packageInfo, customId }) {
  const token = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: customId,
        description: packageInfo.name,
        amount: { currency_code: packageInfo.currency, value: packageInfo.price },
      }],
      application_context: {
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body?.message || 'Unable to create PayPal order')
    error.status = 502
    throw error
  }
  return body
}

export async function capturePayPalOrder(orderId) {
  const token = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: '{}',
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body?.message || 'Unable to capture PayPal order')
    error.status = 502
    error.paypal = body
    throw error
  }
  return body
}

export async function getPayPalOrder(orderId) {
  const token = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body?.message || 'Unable to retrieve PayPal order')
    error.status = 502
    throw error
  }
  return body
}
