import { query, hasDatabase } from '../models/database.js';
import logger from '../utils/logger.js';

const FIELDS = ['brand_voice', 'product_facts', 'audience', 'constraints'];
const COLUMNS = `id, name, ${FIELDS.join(', ')}, created_at, updated_at`;

export async function getProfile(userId) {
  if (!hasDatabase || !userId) return null;
  const r = await query(`SELECT ${COLUMNS} FROM context_profiles WHERE user_id = $1 AND is_default ORDER BY created_at LIMIT 1`, [userId]);
  return r.rows[0] || null;
}

export async function upsertProfile(userId, data) {
  const values = FIELDS.map(f => (data[f] ?? '').toString().trim());
  const r = await query(
    `INSERT INTO context_profiles (user_id, is_default, ${FIELDS.join(', ')})
     VALUES ($1, TRUE, $2, $3, $4, $5)
     ON CONFLICT (user_id) WHERE is_default DO UPDATE
       SET brand_voice = EXCLUDED.brand_voice, product_facts = EXCLUDED.product_facts,
           audience = EXCLUDED.audience, constraints = EXCLUDED.constraints
     RETURNING ${COLUMNS}`,
    [userId, ...values]
  );
  return r.rows[0];
}

/**
 * Load the user's profile and render it as the block the analyst and drafter read.
 * Returns '' when there is nothing useful. Never throws.
 */
export async function buildContextBlock(userId) {
  try {
    const p = await getProfile(userId);
    if (!p) return '';
    const parts = [];
    if (p.brand_voice) parts.push(`Brand voice:\n${p.brand_voice}`);
    if (p.product_facts) parts.push(`Product facts (treat as ground truth; never contradict):\n${p.product_facts}`);
    if (p.audience) parts.push(`Default audience:\n${p.audience}`);
    if (p.constraints) parts.push(`Standing constraints (always apply):\n${p.constraints}`);
    if (!parts.length) return '';
    return `KNOWN FACTS ABOUT THE USER'S BUSINESS (from their saved profile):\n${parts.join('\n\n')}`.slice(0, 6000);
  } catch (err) {
    logger.warn('Profile lookup failed', { error: err.message });
    return '';
  }
}
