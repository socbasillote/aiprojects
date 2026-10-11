import { PostModel } from '../models/index.js';
export function listPosts(workspaceId: string) { return PostModel.find({ workspaceId }).sort({ scheduledAt: 1, createdAt: -1 }).lean(); }
export function updatePost(workspaceId: string, postId: string, update: Record<string, unknown>) { return PostModel.findOneAndUpdate({ _id: postId, workspaceId }, { $set: update }, { new: true, runValidators: true }).lean(); }
