import { describe, it, expect, beforeEach } from 'vitest';

// No DATABASE_URL -> in-memory quota. Loaded fresh so config picks up the env.
process.env.QUOTA_GUEST_PER_DAY = '2';
process.env.QUOTA_FREE_PER_DAY = '3';
process.env.QUOTA_PRO_PER_DAY = '0';
delete process.env.DATABASE_URL;

const { enforceQuota, recordUsage, getUsage, _resetMemoryQuota } = await import('../src/services/QuotaService.js');

const guest = (sid = 'session-abcdef') => ({ headers: { 'x-session-id': sid }, ip: '1.2.3.4' });
const user = (plan = 'free') => ({ headers: {}, ip: '1.2.3.4', user: { id: `u-${plan}`, plan } });

describe('QuotaService (in-memory)', () => {
  beforeEach(() => _resetMemoryQuota());

  it('guests get the guest limit and a 429 with code when exhausted', async () => {
    const req = guest();
    expect((await getUsage(req)).plan).toBe('guest');
    await enforceQuota(req); await recordUsage(req);
    await enforceQuota(req); await recordUsage(req);
    await expect(enforceQuota(req)).rejects.toMatchObject({ status: 429, code: 'QUOTA_EXCEEDED', extra: { usage: { remaining: 0, limit: 2 } } });
  });

  it('separate sessions have separate counters', async () => {
    const a = guest('session-aaaaaa'), b = guest('session-bbbbbb');
    await recordUsage(a); await recordUsage(a);
    expect((await getUsage(b)).used).toBe(0);
  });

  it('free users get the free limit', async () => {
    const req = user('free');
    for (let i = 0; i < 3; i++) { await enforceQuota(req); await recordUsage(req); }
    await expect(enforceQuota(req)).rejects.toMatchObject({ status: 429 });
  });

  it('pro users are unlimited', async () => {
    const req = user('pro');
    const u = await enforceQuota(req);
    expect(u.limit).toBeNull();
    expect((await getUsage(req)).remaining).toBeNull();
  });
});
