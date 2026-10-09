import rateLimit from 'express-rate-limit';

/**
 * Burst protection only. Real quotas live in QuotaService (per user / per day).
 * Keys by user id when signed in so shared IPs (offices, mobile carriers) are not punished together.
 */
const keyByActor = (req) => (req.user?.id ? `u:${req.user.id}` : `ip:${req.ip}`);

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByActor,
};

/** Public read endpoints: 120 req/min */
export const publicLimiter = rateLimit({ ...common, windowMs: 60_000, max: 120,
  message: { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' } });

/** LLM endpoints: 12 req/min per actor (each is several model calls) */
export const generateLimiter = rateLimit({ ...common, windowMs: 60_000, max: 12,
  message: { error: 'Too many generation requests. Please wait a moment.', code: 'RATE_LIMITED' } });

/** Auth endpoints: 20 req/min */
export const authLimiter = rateLimit({ ...common, windowMs: 60_000, max: 20,
  message: { error: 'Too many authentication attempts.', code: 'RATE_LIMITED' } });

/** Writes (library, profile, feedback): 60 req/min */
export const writeLimiter = rateLimit({ ...common, windowMs: 60_000, max: 60,
  message: { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' } });
