import { Router } from 'express';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { query, hasDatabase } from '../models/database.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { getUsage } from '../services/QuotaService.js';
import { config } from '../config.js';
import logger from '../utils/logger.js';

const router = Router();
const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const USER_COLUMNS = 'id, name, email, avatar_url, plan, role, share_examples, created_at';

function publicUser(row) {
  if (!row) return null;
  const { id, name, email, avatar_url, plan, role, share_examples, created_at } = row;
  return { id, name, email, avatar_url, plan: plan || 'free', role: role || 'user', share_examples: share_examples !== false, created_at };
}

function requireAuthConfigured() {
  if (!hasDatabase) throw new HttpError(503, 'Sign-in is unavailable: no database configured.', 'AUTH_NOT_CONFIGURED');
  if (!config.GOOGLE_CLIENT_ID || !config.JWT_SECRET) throw new HttpError(503, 'Sign-in is not configured on this server.', 'AUTH_NOT_CONFIGURED');
}

/**
 * POST /api/auth/google  { credential }
 * Verifies the Google ID token from @react-oauth/google, upserts the user by Google account id.
 */
router.post('/google',
  validate({ body: z.object({ credential: z.string().min(20).max(4096) }) }),
  asyncHandler(async (req, res) => {
    requireAuthConfigured();
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: req.body.credential, audience: config.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch (err) {
      logger.warn('Google credential rejected', { error: err.message });
      throw new HttpError(401, 'Google sign-in failed. Please try again.', 'INVALID_CREDENTIAL');
    }
    if (!payload?.sub || !payload.email) throw new HttpError(401, 'Google account has no email.', 'INVALID_CREDENTIAL');
    if (payload.email_verified === false) throw new HttpError(401, 'Your Google email address is not verified.', 'EMAIL_NOT_VERIFIED');

    const email = payload.email.toLowerCase();
    const isAdmin = config.adminEmails.includes(email);

    // Match on google_sub first; fall back to a legacy row that only has the email.
    const existing = await query(
      `SELECT ${USER_COLUMNS}, google_sub FROM users WHERE deleted_at IS NULL AND (google_sub = $1 OR (google_sub IS NULL AND email = $2)) ORDER BY google_sub NULLS LAST LIMIT 1`,
      [payload.sub, email]
    );

    let row;
    if (existing.rows[0]) {
      row = (await query(
        `UPDATE users SET google_sub = $2, email = $3, name = $4, avatar_url = $5, last_login_at = NOW(),
                          role = CASE WHEN $6 THEN 'admin' ELSE role END
         WHERE id = $1 RETURNING ${USER_COLUMNS}`,
        [existing.rows[0].id, payload.sub, email, payload.name || existing.rows[0].name, payload.picture || null, isAdmin]
      )).rows[0];
    } else {
      row = (await query(
        `INSERT INTO users (google_sub, email, name, avatar_url, last_login_at, role)
         VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING ${USER_COLUMNS}`,
        [payload.sub, email, payload.name || email.split('@')[0], payload.picture || null, isAdmin ? 'admin' : 'user']
      )).rows[0];
      logger.info('New user signed up', { userId: row.id });
    }

    const user = publicUser(row);
    res.json({ token: signToken(user), user });
  })
);

/** GET /api/auth/me → { user, usage } */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
  const r = await query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1 AND deleted_at IS NULL`, [req.user.id]);
  if (!r.rows[0]) throw new HttpError(401, 'This account no longer exists.', 'UNAUTHENTICATED');
  const user = publicUser(r.rows[0]);
  // Keep quota decisions on the stored plan, not the token's snapshot.
  req.user.plan = user.plan;
  res.json({ user, usage: await getUsage(req) });
}));

/** PUT /api/auth/preferences { share_examples } — opt in/out of contributing to the shared knowledge base. */
router.put('/preferences', requireAuth,
  validate({ body: z.object({ share_examples: z.boolean() }) }),
  asyncHandler(async (req, res) => {
    if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
    const r = await query(`UPDATE users SET share_examples = $2 WHERE id = $1 RETURNING ${USER_COLUMNS}`, [req.user.id, req.body.share_examples]);
    if (!req.body.share_examples) {
      // Withdraw anything this user already contributed.
      await query(`UPDATE exemplars SET active = FALSE WHERE source = 'user' AND generation_id IN (SELECT id FROM generations WHERE user_id = $1)`, [req.user.id]);
    }
    res.json({ user: publicUser(r.rows[0]) });
  })
);

/** POST /api/auth/logout — stateless tokens; the client discards it. */
router.post('/logout', requireAuth, (req, res) => {
  res.json({ success: true });
});

/** DELETE /api/auth/account — delete the user and everything they own (cascades). */
router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
  await query(`DELETE FROM exemplars WHERE source = 'user' AND generation_id IN (SELECT id FROM generations WHERE user_id = $1)`, [req.user.id]);
  await query('DELETE FROM users WHERE id = $1', [req.user.id]);
  await query(`DELETE FROM usage_daily WHERE actor_key = $1`, [`user:${req.user.id}`]);
  logger.info('Account deleted', { userId: req.user.id });
  res.json({ success: true });
}));

export default router;
