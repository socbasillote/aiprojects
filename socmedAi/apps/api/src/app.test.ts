import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';
describe('Storm API', () => { it('reports a truthful health state', async () => { const response = await request(app).get('/api/health'); expect([200, 503]).toContain(response.status); expect(['connected', 'disconnected', 'unconfigured']).toContain(response.body.database); expect(response.body.ok).toBe(response.status === 200); }); it('rejects protected post access without a session', async () => { const response = await request(app).get('/api/posts').set('x-workspace-id', 'demo-workspace'); expect(response.status).toBe(401); }); });
