import { z } from 'zod';

/**
 * Boot-time configuration. Fails fast with a readable list of problems instead
 * of discovering a missing secret on the first request.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Comma-separated list of allowed browser origins. Required in production.
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  APP_URL: z.string().optional(),

  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Quota (generations per UTC day). Empty/0 for pro means unlimited.
  QUOTA_GUEST_PER_DAY: z.coerce.number().int().nonnegative().default(5),
  QUOTA_FREE_PER_DAY: z.coerce.number().int().nonnegative().default(15),
  QUOTA_PRO_PER_DAY: z.coerce.number().int().nonnegative().default(0),

  // Request size caps
  MAX_REQUEST_CHARS: z.coerce.number().int().positive().default(4000),
  MAX_PROMPT_CHARS: z.coerce.number().int().positive().default(20000),

  ADMIN_EMAILS: z.string().default(''),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const problems = parsed.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const config = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  allowedOrigins: parsed.data.FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean),
  adminEmails: parsed.data.ADMIN_EMAILS.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
};

/**
 * Production-only requirements. Called from server.js so tests can import
 * modules without a full production environment.
 */
export function assertProductionReady() {
  const missing = [];
  if (!config.DATABASE_URL) missing.push('DATABASE_URL');
  if (!config.JWT_SECRET) missing.push('JWT_SECRET');
  if (!config.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (config.allowedOrigins.some(o => o.includes('localhost'))) missing.push('FRONTEND_URL (still points at localhost)');
  if (missing.length) {
    throw new Error(`Refusing to start in production without: ${missing.join(', ')}`);
  }
}

export default config;
