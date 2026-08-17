import 'dotenv/config'

const required = ['MONGODB_URI', 'JWT_SECRET']
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required in the environment`)
}

const isProduction = process.env.NODE_ENV === 'production'
const storageProvider = process.env.STORAGE_PROVIDER || 'local'

if (isProduction && String(process.env.JWT_SECRET).length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production')
}
if (isProduction && !(process.env.CLIENT_ORIGIN || '').startsWith('https://')) {
  throw new Error('CLIENT_ORIGIN must use HTTPS in production')
}
if (!['local', 'r2'].includes(storageProvider)) {
  throw new Error('STORAGE_PROVIDER must be local or r2')
}
if (storageProvider === 'r2') {
  for (const key of ['R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_BASE_URL']) {
    if (!process.env[key]) throw new Error(`${key} is required when STORAGE_PROVIDER=r2`)
  }
  if (!process.env.R2_ENDPOINT && !process.env.R2_ACCOUNT_ID) {
    throw new Error('R2_ENDPOINT or R2_ACCOUNT_ID is required when STORAGE_PROVIDER=r2')
  }
}

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
  storageProvider,
  r2AccountId: process.env.R2_ACCOUNT_ID || '',
  r2Endpoint: process.env.R2_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : ''),
  r2Bucket: process.env.R2_BUCKET || '',
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL || '',
  isProduction,
}
