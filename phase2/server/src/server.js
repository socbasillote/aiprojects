import express from 'express'
import cors from 'cors'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import designRoutes from './routes/designRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import assetRoutes from './routes/assetRoutes.js'
import path from 'node:path'
import { notFound, errorHandler } from './middleware/errorHandler.js'

await connectDatabase()

const app = express()
app.use(cors({ origin: env.clientOrigin }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/designs', designRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/assets', assetRoutes)
app.use('/api/ai', aiRoutes)
app.use(notFound)
app.use(errorHandler)

app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`))
