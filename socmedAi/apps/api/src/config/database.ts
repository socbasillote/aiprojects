import mongoose from 'mongoose';
import { env } from './env.js';

let connected = false;
export async function connectDatabase() {
  if (!env.MONGODB_URI) { console.warn('[storm] MONGODB_URI is not configured; persistence is unavailable.'); return false; }
  if (connected) return true;
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, { maxPoolSize: env.MONGODB_MAX_POOL_SIZE, minPoolSize: 1, serverSelectionTimeoutMS: 5000, family: 4, autoIndex: env.NODE_ENV !== 'production' });
    connected = true;
    await mongoose.connection.syncIndexes();
    console.log('[storm] MongoDB Atlas connected and indexes synchronized.');
    return true;
  } catch (error) { connected = false; console.error('[storm] MongoDB connection failed:', error instanceof Error ? error.message : 'unknown error'); return false; }
}
export async function disconnectDatabase() { if (connected) await mongoose.disconnect(); connected = false; }
export function isDatabaseConnected() { return connected && mongoose.connection.readyState === 1; }
