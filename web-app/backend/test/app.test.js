import { describe, it, expect } from 'vitest';
import request from 'supertest';

// Route-level tests without a database or LLM provider: validation, CORS, 404, health.
delete process.env.DATABASE_URL;
process.env.FRONTEND_URL = 'https://app.example.com';
process.env.NODE_ENV = 'test';
for (const k of Object.keys(process.env)) if (/_API_KEY$|_TOKEN$|_BASE_URL$/.test(k)) delete process.env[k];

const { default: app } = await import('../src/app.js');

describe('app', () => {
  it('health reports degraded when no provider is configured', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(503);
    expect(r.body.database).toBe('not_configured');
    expect(r.body.providers).toBe(0);
  });

  it('rejects malformed input with 400 and a code instead of crashing', async () => {
    const r = await request(app).post('/api/ai/generate').send({ request: 'hi' });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('VALIDATION_ERROR');
    const r2 = await request(app).post('/api/prompts/generate').send({ templateId: 'x', formData: null });
    expect(r2.status).toBe(400);
    const r3 = await request(app).get('/api/prompts/not-a-uuid').set('Authorization', 'Bearer nope');
    expect(r3.status).toBe(401);
  });

  it('returns 503 with MODELS_UNAVAILABLE when no provider can answer', async () => {
    const r = await request(app).post('/api/ai/generate').set('X-Session-Id', 'session-test-1').send({ request: 'Write a cold email to a founder' });
    expect(r.status).toBe(503);
    expect(r.body.code).toBe('MODELS_UNAVAILABLE');
  });

  it('CORS only reflects configured origins', async () => {
    const ok = await request(app).get('/api/templates').set('Origin', 'https://app.example.com');
    expect(ok.headers['access-control-allow-origin']).toBe('https://app.example.com');
    const bad = await request(app).get('/api/templates').set('Origin', 'https://evil.example');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('serves the 30 templates and 404s unknown routes', async () => {
    expect((await request(app).get('/api/templates')).body).toHaveLength(30);
    const r = await request(app).get('/api/nope');
    expect(r.status).toBe(404);
    expect(r.body.code).toBe('NOT_FOUND');
  });

  it('library requires sign-in', async () => {
    const r = await request(app).get('/api/prompts');
    expect(r.status).toBe(401);
    expect(r.body.code).toBe('UNAUTHENTICATED');
  });
});
