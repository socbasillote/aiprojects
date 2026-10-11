import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({ NODE_ENV:z.enum(['development','test','production']).default('development'), PORT:z.coerce.number().default(4000), WEB_ORIGIN:z.string().default('http://localhost:5173'), MONGODB_URI:z.string().optional(), MONGODB_MAX_POOL_SIZE:z.coerce.number().int().positive().default(10), SUPABASE_URL:z.string().url().optional(), SUPABASE_PUBLISHABLE_KEY:z.string().optional(), DEV_AUTH_BYPASS:z.string().default('false').transform((value) => value === 'true'), REDIS_URL:z.string().optional() });
export const env = schema.parse(process.env);
