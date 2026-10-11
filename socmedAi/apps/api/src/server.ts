import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
await connectDatabase();
app.listen(env.PORT,()=>console.log(`Storm API listening on http://localhost:${env.PORT}`));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, async () => { await disconnectDatabase(); process.exit(0); });
