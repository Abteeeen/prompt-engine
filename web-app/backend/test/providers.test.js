import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'node:http';

// Each test gets a fresh module instance so env + in-memory cooldown state start clean.
async function loadProviders(env) {
  for (const k of Object.keys(process.env)) if (/_API_KEY$|_TOKEN$|^LLM_|^HF_|^CF_|_BASE_URL$|_MODEL$/.test(k)) delete process.env[k];
  Object.assign(process.env, env);
  vi.resetModules();
  return import('../src/services/llm/providers.js');
}

/** Mock OpenAI-compatible server: behaviour keyed by bearer token. */
function mockServer() {
  const seen = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const key = (req.headers.authorization || '').replace('Bearer ', '');
      const payload = JSON.parse(body || '{}');
      seen.push({ url: req.url, key, model: payload.model });
      const json = (code, obj, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', ...headers }); res.end(JSON.stringify(obj)); };
      if (key === 'k-429') return json(429, { error: { message: 'Rate limit reached' } }, { 'Retry-After': '30' });
      if (key === 'k-daily') return json(429, { error: { message: 'You have exceeded your tokens per day (TPD) limit' } });
      if (key === 'k-402') return json(402, { error: { message: 'Insufficient credits' } });
      if (key === 'k-dead') return json(401, { error: { message: 'Invalid API key' } });
      if (key === 'k-500') return json(500, { error: { message: 'boom' } });
      return json(200, { model: payload.model, choices: [{ message: { content: `ok:${key}` } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ server, seen, url: `http://127.0.0.1:${server.address().port}` })));
}

describe('provider pool', () => {
  let mock;
  beforeEach(async () => { mock = await mockServer(); });
  afterEach(() => mock.server.close());

  it('resolves per-role models and ignores unconfigured providers', async () => {
    const P = await loadProviders({ GROQ_API_KEY: 'a', GEMINI_API_KEY: 'b', LLM_MODEL_DRAFTER: 'gemini:gemini-2.5-pro', LLM_MODEL_CRITIC: 'cerebras' });
    expect(P.configuredProviders()).toEqual(['groq', 'gemini']);
    expect(P.resolveModel('DRAFTER')).toEqual({ provider: 'gemini', model: 'gemini-2.5-pro' });
    // cerebras has no key -> falls back to first configured provider
    expect(P.resolveModel('CRITIC').provider).toBe('groq');
  });

  it('rotates keys and cools down exhausted ones', async () => {
    const P = await loadProviders({ GROQ_BASE_URL: `${mock.url}/groq`, GROQ_API_KEY: 'k-402,k-429,k-ok' });
    const r = await P.chatResilient('sys', 'hi', { role: 'DRAFTER' });
    expect(r.text).toBe('ok:k-ok');
    expect(r.keyIndex).toBe(2);
    const groq = P.providerStatus().providers.find(p => p.name === 'groq');
    expect(groq.keys[0].healthy).toBe(false);
    expect(groq.keys[0].cooldownSeconds).toBeGreaterThan(3600);     // credits: 6h
    expect(groq.keys[1].healthy).toBe(false);
    expect(groq.keys[1].cooldownSeconds).toBeLessThanOrEqual(30);  // Retry-After honoured
    expect(groq.keys[2].healthy).toBe(true);
    // Second call goes straight to the healthy key without touching the others
    const before = mock.seen.length;
    await P.chatResilient('sys', 'again', { role: 'DRAFTER' });
    expect(mock.seen.length - before).toBe(1);
  });

  it('hops across providers and skips cooled ones on later calls', async () => {
    const P = await loadProviders({
      LLM_PROVIDER_ORDER: 'groq,cerebras,gemini',
      GROQ_BASE_URL: `${mock.url}/groq`, GROQ_API_KEY: 'k-dead,k-daily',
      CEREBRAS_BASE_URL: `${mock.url}/cerebras`, CEREBRAS_API_KEY: 'k-500',
      GEMINI_BASE_URL: `${mock.url}/gemini`, GEMINI_API_KEY: 'k-ok-gem',
    });
    const r1 = await P.chatResilient('sys', 'hi', { role: 'DRAFTER' });
    expect(r1.provider).toBe('gemini');
    expect(mock.seen.map(s => s.url)).toEqual(['/groq', '/groq', '/cerebras', '/gemini']);
    expect(P.availableProviders()).toEqual(['gemini']);
    const r2 = await P.chatResilient('sys', 'hi', { role: 'DRAFTER' });
    expect(r2.provider).toBe('gemini');
    expect(mock.seen.length).toBe(5);
    const groq = P.providerStatus().providers.find(p => p.name === 'groq');
    expect(groq.keys[1].cooldownSeconds).toBeGreaterThan(60 * 60); // daily quota parks until reset
  });

  it('enforces LLM_DAILY_LIMITS', async () => {
    const P = await loadProviders({ LLM_DAILY_LIMITS: 'groq:1', GROQ_BASE_URL: `${mock.url}/groq`, GROQ_API_KEY: 'k-ok' });
    await P.chatResilient('sys', 'one', { role: 'DRAFTER' });
    await expect(P.chatResilient('sys', 'two', { role: 'DRAFTER' })).rejects.toThrow(/daily cap|skipped/);
  });

  it('accumulates token usage into a tally', async () => {
    const P = await loadProviders({ GROQ_BASE_URL: `${mock.url}/groq`, GROQ_API_KEY: 'k-ok' });
    const tally = {};
    await P.chatResilient('sys', 'one', { role: 'DRAFTER', tally });
    await P.chatResilient('sys', 'two', { role: 'DRAFTER', tally });
    expect(tally).toEqual({ calls: 2, prompt_tokens: 20, completion_tokens: 10 });
  });

  it('throws a clear error with no providers configured', async () => {
    const P = await loadProviders({});
    expect(P.configuredProviders()).toEqual([]);
    await expect(P.chatResilient('sys', 'x', {})).rejects.toThrow(/No LLM provider configured/);
  });

  it('msUntilReset is within a day and adds slack', async () => {
    const P = await loadProviders({});
    const ms = P.msUntilReset('UTC');
    expect(ms).toBeGreaterThan(5 * 60 * 1000);
    expect(ms).toBeLessThanOrEqual(24 * 3600 * 1000 + 5 * 60 * 1000);
  });
});
