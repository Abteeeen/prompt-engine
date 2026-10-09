import { query, hasDatabase } from '../models/database.js';
import { config } from '../config.js';
import { actorKey } from '../middleware/auth.js';
import { HttpError } from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Daily generation quota per actor (signed-in user, else browser session, else IP).
 * Backed by usage_daily; falls back to an in-memory map when no database is configured
 * (local development). Fails CLOSED on a database error for guests and OPEN for signed-in
 * users, so a DB hiccup never blocks a paying customer but also never hands out free
 * unlimited calls to anonymous traffic.
 */

const memory = new Map(); // `${actorKey}|${day}` -> count

export function todayUTC() { return new Date().toISOString().slice(0, 10); }

function resetsAt() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

export function planFor(req) {
  if (!req.user) return 'guest';
  return req.user.plan === 'pro' ? 'pro' : 'free';
}

export function limitFor(plan) {
  const n = plan === 'guest' ? config.QUOTA_GUEST_PER_DAY
    : plan === 'pro' ? config.QUOTA_PRO_PER_DAY
    : config.QUOTA_FREE_PER_DAY;
  return n > 0 ? n : null; // null = unlimited
}

async function readCount(key) {
  const day = todayUTC();
  if (!hasDatabase) return memory.get(`${key}|${day}`) || 0;
  const r = await query('SELECT generations FROM usage_daily WHERE actor_key = $1 AND day = $2', [key, day]);
  return r.rows[0]?.generations || 0;
}

async function increment(key, tokens = 0) {
  const day = todayUTC();
  if (!hasDatabase) {
    const k = `${key}|${day}`;
    memory.set(k, (memory.get(k) || 0) + 1);
    return memory.get(k);
  }
  const r = await query(
    `INSERT INTO usage_daily (actor_key, day, generations, tokens)
     VALUES ($1, $2, 1, $3)
     ON CONFLICT (actor_key, day) DO UPDATE
       SET generations = usage_daily.generations + 1,
           tokens = usage_daily.tokens + EXCLUDED.tokens,
           updated_at = NOW()
     RETURNING generations`,
    [key, day, tokens]
  );
  return r.rows[0].generations;
}

/** Current usage for the request's actor. Never throws. */
export async function getUsage(req) {
  const plan = planFor(req);
  const limit = limitFor(plan);
  let used = 0;
  try { used = await readCount(actorKey(req)); } catch (err) {
    logger.warn('Usage lookup failed', { error: err.message });
  }
  return {
    plan,
    used,
    limit,
    remaining: limit === null ? null : Math.max(0, limit - used),
    resetsAt: resetsAt(),
  };
}

/**
 * Enforce the quota for one generation. Throws HttpError 429 when exhausted.
 * Returns the usage object (before increment). Call recordUsage() after success.
 */
export async function enforceQuota(req) {
  const plan = planFor(req);
  const limit = limitFor(plan);
  if (limit === null) return { plan, used: 0, limit, remaining: null, resetsAt: resetsAt() };

  let used;
  try {
    used = await readCount(actorKey(req));
  } catch (err) {
    logger.error('Quota check failed', { error: err.message, plan });
    if (plan === 'guest') throw new HttpError(503, 'Usage tracking is unavailable. Please sign in or try again shortly.', 'QUOTA_UNAVAILABLE');
    used = 0; // fail open for signed-in users
  }

  if (used >= limit) {
    const usage = { plan, used, limit, remaining: 0, resetsAt: resetsAt() };
    const message = plan === 'guest'
      ? `You have used today's ${limit} free generations. Sign in with Google for ${config.QUOTA_FREE_PER_DAY} a day.`
      : `You have used today's ${limit} generations. Your quota resets at midnight UTC.`;
    throw new HttpError(429, message, 'QUOTA_EXCEEDED', { usage });
  }
  return { plan, used, limit, remaining: limit - used, resetsAt: resetsAt() };
}

/** Record one successful generation. Never throws. */
export async function recordUsage(req, tokens = 0) {
  try {
    const used = await increment(actorKey(req), tokens);
    const plan = planFor(req);
    const limit = limitFor(plan);
    return { plan, used, limit, remaining: limit === null ? null : Math.max(0, limit - used), resetsAt: resetsAt() };
  } catch (err) {
    logger.warn('Usage increment failed', { error: err.message });
    return getUsage(req);
  }
}

/** Test helper. */
export function _resetMemoryQuota() { memory.clear(); }
