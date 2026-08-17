import 'dotenv/config'
import { S3Client, ListBucketsCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID || ''
const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '')
const bucket = process.env.R2_BUCKET || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''

for (const [name, value] of Object.entries({ R2_ENDPOINT: endpoint, R2_BUCKET: bucket, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey })) {
  if (!value) throw new Error(`${name} is required`)
}

const client = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId, secretAccessKey } })
console.log(`Testing R2 endpoint: ${endpoint}`)
console.log(`Testing bucket: ${bucket}`)

const buckets = await client.send(new ListBucketsCommand({}))
console.log('Accessible buckets:', (buckets.Buckets || []).map((item) => item.Name))

const key = `r2-test/${Date.now()}.txt`
await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'R2 connection test', ContentType: 'text/plain' }))
console.log(`Upload successful: ${key}`)
await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
console.log(`Delete successful: ${key}`)
console.log('R2 connection test passed.')
