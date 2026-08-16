import 'dotenv/config'

const required = ['MONGODB_URI', 'JWT_SECRET']
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required in the environment`)
}
const isProduction = process.env.NODE_ENV === 'production'
if (isProduction && String(process.env.JWT_SECRET).length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production')
if (isProduction && !(process.env.CLIENT_ORIGIN || '').startsWith('https://')) throw new Error('CLIENT_ORIGIN must use HTTPS in production')

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-5.5',
  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
  paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
  isProduction,
}
