import pg from 'pg';
import logger from '../utils/logger.js';

const { Pool } = pg;

export const hasDatabase = Boolean(process.env.DATABASE_URL);

function sslFor(url) {
  // Supabase, Neon, Render and most hosted Postgres need TLS. Local sockets and localhost do not.
  if (!url || /localhost|127\.0\.0\.1|host=\//.test(url)) return false;
  if (process.env.PGSSL_REJECT_UNAUTHORIZED === 'false') return { rejectUnauthorized: false };
  return { rejectUnauthorized: true };
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslFor(process.env.DATABASE_URL),
  max: parseInt(process.env.PG_POOL_MAX || '5', 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', { error: err.message });
});

let healthy = false;

export async function query(text, params) {
  if (!hasDatabase) throw Object.assign(new Error('Database not configured'), { code: 'NO_DATABASE', status: 503 });
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    healthy = true;
    logger.debug('Query executed', { duration: Date.now() - start, rows: result.rowCount });
    return result;
  } catch (err) {
    healthy = false;
    // Never log parameter values: they contain user prompts and emails.
    logger.error('Query failed', { error: err.message, code: err.code });
    throw err;
  }
}

export async function testConnection() {
  const result = await query('SELECT NOW() AS now');
  logger.info('Database connected', { time: result.rows[0].now });
  return true;
}

export function isDatabaseHealthy() {
  return hasDatabase && healthy;
}

export async function closeDatabase() {
  await pool.end().catch(() => {});
}

export default pool;
