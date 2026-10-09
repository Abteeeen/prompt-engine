/**
 * Run SQL migrations from backend/migrations in filename order.
 * Tracks applied files in schema_migrations so it is safe to run on every deploy.
 *
 *   node src/models/migrate.js          # apply pending
 *   node src/models/migrate.js --status # list applied / pending
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { pool, query, testConnection } from './database.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

export async function runMigrations({ log = logger } = {}) {
  await query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  const applied = new Set((await query('SELECT filename FROM schema_migrations')).rows.map(r => r.filename));
  const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const pending = files.filter(f => !applied.has(f));

  for (const file of pending) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      log.info(`Applied migration ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
  return { applied: [...applied], ran: pending };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  (async () => {
    try {
      await testConnection();
      if (process.argv.includes('--status')) {
        const applied = new Set((await query('SELECT filename FROM schema_migrations').catch(() => ({ rows: [] }))).rows.map(r => r.filename));
        for (const f of readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()) {
          console.log(`${applied.has(f) ? 'applied' : 'pending'}  ${f}`);
        }
      } else {
        const r = await runMigrations();
        logger.info(`Migrations complete: ${r.ran.length} applied, ${r.applied.length} already present`);
      }
      await pool.end();
      process.exit(0);
    } catch (err) {
      logger.error('Migration failed', { error: err.message });
      process.exit(1);
    }
  })();
}
