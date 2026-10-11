import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { createPostSchema } from '@storm/shared';
import { PostModel, UserProfileModel, WorkspaceMemberModel, WorkspaceModel } from './models/index.js';
import { env } from './config/env.js';
import { requireAuth, requireRole, requireWorkspace } from './middleware/auth.js';
import { listPosts, updatePost } from './repositories/post.repository.js';
import { isDatabaseConnected } from './config/database.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => { res.setHeader('x-request-id', randomUUID()); next(); });
app.get('/api/health', (_req, res) => { const database = isDatabaseConnected() ? 'connected' : env.MONGODB_URI ? 'disconnected' : 'unconfigured'; const ok = database !== 'disconnected'; return res.status(ok ? 200 : 503).json({ ok, service: 'storm-api', timestamp: new Date().toISOString(), database }); });

type MemoryPost = Record<string, unknown> & { id: string; workspaceId: string; createdAt: string; updatedAt: string };
const memoryPosts: MemoryPost[] = [];
function createMemoryPost(input: Record<string, unknown>) { const now = new Date().toISOString(); return { ...input, id: randomUUID(), createdAt: now, updatedAt: now } as MemoryPost; }

app.get('/api/me', requireAuth, async (req, res, next) => { try { if (!env.MONGODB_URI || req.auth?.isDev) return res.json({ userId: req.auth?.userId, sessionId: req.auth?.sessionId }); const profile = await UserProfileModel.findOne({ supabaseUserId: req.auth?.userId }).lean(); return res.json({ userId: req.auth?.userId, sessionId: req.auth?.sessionId, profile }); } catch (error) { return next(error); } });
app.post('/api/profile', requireAuth, async (req, res, next) => { try { if (!env.MONGODB_URI) return res.status(201).json({ supabaseUserId: req.auth?.userId, displayName: req.body.displayName ?? 'Storm user' }); const profile = await UserProfileModel.findOneAndUpdate({ supabaseUserId: req.auth?.userId }, { $set: { email: req.body.email, displayName: req.body.displayName, avatarUrl: req.body.avatarUrl } }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }); return res.status(201).json(profile); } catch (error) { return next(error); } });
app.use('/api/workspaces', requireAuth);
app.get('/api/workspaces', (_req, res) => res.json({ workspaces: [], message: 'Workspace list is available after profile synchronization.' }));
app.post('/api/workspaces', async (req, res, next) => { try { const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''; if (!name) return res.status(400).json({ error: 'Workspace name is required' }); if (!env.MONGODB_URI) return res.status(201).json({ id: randomUUID(), name, role: 'Owner', devOnly: true }); const profile = await UserProfileModel.findOne({ supabaseUserId: req.auth?.userId }); if (!profile) return res.status(400).json({ error: 'Create a user profile before creating a workspace' }); const workspace = await WorkspaceModel.create({ name, createdBy: profile._id }); await WorkspaceMemberModel.create({ workspaceId: workspace._id, userId: profile._id, role: 'Owner' }); return res.status(201).json({ id: String(workspace._id), name: workspace.name, role: 'Owner' }); } catch (error) { return next(error); } });

app.use('/api/posts', requireAuth, requireWorkspace);
app.get('/api/posts', async (req, res, next) => { try { const workspaceId = String(req.workspaceId); if (!env.MONGODB_URI) return res.json(memoryPosts.filter((post) => post.workspaceId === workspaceId)); const posts = await listPosts(workspaceId); return res.json(posts.map((post) => ({ ...post, id: String(post._id) }))); } catch (error) { return next(error); } });
app.post('/api/posts', requireRole('Owner', 'Admin', 'Editor'), async (req, res, next) => { try { const parsed = createPostSchema.parse(req.body); const workspaceId = String(req.workspaceId); const status = parsed.scheduledAt ? 'queued' : 'draft'; if (!env.MONGODB_URI) { if (!env.DEV_AUTH_BYPASS) return res.status(503).json({ error: 'Persistence is not configured' }); const post = createMemoryPost({ ...parsed, workspaceId, status }); memoryPosts.push(post); return res.status(201).json(post); } const post = await PostModel.create({ ...parsed, workspaceId, status }); return res.status(201).json({ ...post.toObject(), id: String(post._id) }); } catch (error) { return next(error); } });
app.patch('/api/posts/:id', requireRole('Owner', 'Admin', 'Editor'), async (req, res, next) => { try { const workspaceId = String(req.workspaceId); const postId = String(req.params.id); if (!env.MONGODB_URI) { const post = memoryPosts.find((item) => item.id === postId && item.workspaceId === workspaceId); if (!post) return res.status(404).json({ error: 'Post not found' }); Object.assign(post, req.body, { updatedAt: new Date().toISOString() }); return res.json(post); } const post = await updatePost(workspaceId, postId, req.body); if (!post) return res.status(404).json({ error: 'Post not found' }); return res.json({ ...post, id: String(post._id) }); } catch (error) { return next(error); } });
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { const message = error instanceof Error ? error.message : 'Unexpected error'; res.status(400).json({ error: message }); });
