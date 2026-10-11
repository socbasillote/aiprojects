import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { WorkspaceMemberModel, UserProfileModel } from '../models/index.js';

declare global { namespace Express { interface Request { auth?: { userId: string; sessionId?: string; isDev?: boolean }; workspaceId?: string; role?: string } } }
const supabase = env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY ? createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }) : null;

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) { if (env.DEV_AUTH_BYPASS && env.NODE_ENV !== 'production') { req.auth = { userId: 'dev-user', sessionId: 'dev-session', isDev: true }; return next(); } return res.status(401).json({ error: 'Authentication required' }); }
  if (!supabase) return res.status(503).json({ error: 'Supabase authentication is not configured' });
  try { const { data, error } = await supabase.auth.getUser(header.slice(7)); if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired Supabase session' }); req.auth = { userId: data.user.id }; return next(); } catch { return res.status(401).json({ error: 'Invalid or expired Supabase session' }); }
}
export async function requireWorkspace(req: Request, res: Response, next: NextFunction) {
  const workspaceId = req.header('x-workspace-id'); if (!workspaceId) return res.status(400).json({ error: 'Workspace context is required' });
  if (!req.auth?.isDev && !mongoose.isValidObjectId(workspaceId)) return res.status(400).json({ error: 'Workspace ID is invalid' });
  if (req.auth?.isDev) { req.workspaceId = workspaceId; req.role = 'Owner'; return next(); }
  try { const profile = await UserProfileModel.findOne({ supabaseUserId: req.auth?.userId }).select('_id').lean(); const membership = profile ? await WorkspaceMemberModel.findOne({ workspaceId, userId: profile._id }).lean() : null; if (!membership) return res.status(403).json({ error: 'You do not have access to this workspace' }); req.workspaceId = workspaceId; req.role = String(membership.role); return next(); } catch { return res.status(503).json({ error: 'Workspace authorization unavailable' }); }
}
export function requireRole(...roles: string[]) { return (req: Request, res: Response, next: NextFunction) => roles.includes(req.role ?? '') ? next() : res.status(403).json({ error: 'Insufficient workspace permissions' }); }
