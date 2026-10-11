import { z } from 'zod';

export const postStatus = z.enum(['draft','queued','publishing','published','failed','cancelled']);
export const platform = z.enum(['facebook','instagram','linkedin']);
export const createPostSchema = z.object({
  caption: z.string().max(2200).default(''),
  platforms: z.array(platform).min(1),
  mediaUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
  timezone: z.string().default('UTC')
});
export type PostStatus = z.infer<typeof postStatus>;
export type Platform = z.infer<typeof platform>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type Post = CreatePostInput & { id: string; status: PostStatus; createdAt: string; updatedAt: string };
