import { Router } from 'express';
import { z } from 'zod';
import { generatePrompt } from '../services/PromptGeneratorService.js';
import { scorePrompt } from '../services/QualityScorerService.js';
import { trackEvent } from '../services/AnalyticsService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { query, pool, hasDatabase } from '../models/database.js';
import { enforceQuota, recordUsage } from '../services/QuotaService.js';
import { recordGeneration } from '../services/GenerationsService.js';
import { config } from '../config.js';

const router = Router();
const uuid = z.string().uuid();
const needDb = () => { if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE'); };

// ── Template fill (no LLM, still quota-counted so guests cannot farm it) ──────
router.post('/generate',
  validate({ body: z.object({
    templateId: z.string().min(1).max(60),
    formData: z.record(z.string().max(2000)).default({}),
    options: z.record(z.string().max(200)).optional(),
  }) }),
  asyncHandler(async (req, res) => {
    const { templateId, formData, options = {} } = req.body;
    await enforceQuota(req);

    let topic = formData.topic || '';
    let command = null;
    if (topic.startsWith('/improve ')) { command = 'improve'; formData.topic = topic.slice(9).trim(); }
    else if (topic.startsWith('/expand ')) { command = 'expand'; formData.topic = topic.slice(8).trim(); }

    const result = generatePrompt(templateId, formData, { ...options, command });
    if (!result) throw new HttpError(404, 'Template not found.', 'NOT_FOUND');

    const scored = scorePrompt(result.prompt);
    const usage = await recordUsage(req);
    recordGeneration({ req, kind: 'template', request: `[${templateId}] ${JSON.stringify(formData).slice(0, 2000)}`,
      result: { prompt: result.prompt, domain: templateId, qualityScore: scored, source: 'template', model: 'template' } });
    trackEvent({ eventType: 'prompt_generated', templateId, sessionId: req.headers['x-session-id'], userId: req.user?.id, qualityScore: scored.overallScore, metadata: { command } });

    res.json({ ...result, qualityScore: scored, usage });
  })
);

// ── Library ──────────────────────────────────────────────────────────────────
const LIST_SQL = `
  SELECT p.id, p.title, p.domain, p.tags, p.is_favorite, p.rating, p.created_at, p.updated_at,
         v.score, (SELECT COUNT(*)::int FROM prompt_versions pv WHERE pv.prompt_id = p.id) AS version_count
  FROM prompts p LEFT JOIN prompt_versions v ON v.id = p.current_version_id
  WHERE p.user_id = $1`;

async function loadDetail(userId, id) {
  const p = await query(`${LIST_SQL} AND p.id = $2`, [userId, id]);
  if (!p.rows[0]) return null;
  const versions = await query(
    `SELECT id, version_no, body, score, created_at FROM prompt_versions WHERE prompt_id = $1 ORDER BY version_no DESC`, [id]);
  const current = versions.rows.find(v => v.version_no === Math.max(...versions.rows.map(x => x.version_no))) || versions.rows[0];
  return { ...p.rows[0], body: current?.body || '', versions: versions.rows };
}

router.get('/', requireAuth,
  validate({ query: z.object({
    sort: z.enum(['updated_at', 'created_at', 'score', 'title']).default('updated_at'),
    tag: z.string().max(40).optional(),
    favorite: z.enum(['true', 'false']).optional(),
    q: z.string().max(200).optional(),
  }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const { sort, tag, favorite, q } = req.query;
    const params = [req.user.id];
    let sql = LIST_SQL;
    if (tag) { params.push(tag); sql += ` AND $${params.length} = ANY(p.tags)`; }
    if (favorite === 'true') sql += ` AND p.is_favorite`;
    if (q) { params.push(`%${q}%`); sql += ` AND (p.title ILIKE $${params.length} OR EXISTS (SELECT 1 FROM prompt_versions pv WHERE pv.id = p.current_version_id AND pv.body ILIKE $${params.length}))`; }
    const order = { updated_at: 'p.updated_at DESC', created_at: 'p.created_at DESC', score: 'v.score DESC NULLS LAST', title: 'p.title ASC' }[sort];
    sql += ` ORDER BY ${order} LIMIT 500`;
    res.json((await query(sql, params)).rows);
  })
);

router.post('/', requireAuth,
  validate({ body: z.object({
    title: z.string().trim().min(1).max(200),
    body: z.string().min(1).max(config.MAX_PROMPT_CHARS),
    domain: z.string().max(60).optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    score: z.coerce.number().int().min(0).max(30).optional().nullable(),
    generationId: z.string().uuid().optional().nullable(),
  }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const { title, body, domain, tags, score, generationId } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const p = await client.query(
        `INSERT INTO prompts (user_id, title, domain, tags, source_generation) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [req.user.id, title, domain || null, tags, generationId || null]);
      const v = await client.query(
        `INSERT INTO prompt_versions (prompt_id, version_no, body, score) VALUES ($1, 1, $2, $3) RETURNING id`,
        [p.rows[0].id, body, score ?? null]);
      await client.query(`UPDATE prompts SET current_version_id = $2 WHERE id = $1`, [p.rows[0].id, v.rows[0].id]);
      await client.query('COMMIT');
      trackEvent({ eventType: 'prompt_saved', templateId: domain, userId: req.user.id, qualityScore: score });
      res.status(201).json(await loadDetail(req.user.id, p.rows[0].id));
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })
);

router.get('/:id', requireAuth, validate({ params: z.object({ id: uuid }) }), asyncHandler(async (req, res) => {
  needDb();
  const detail = await loadDetail(req.user.id, req.params.id);
  if (!detail) throw new HttpError(404, 'Prompt not found.', 'NOT_FOUND');
  res.json(detail);
}));

router.put('/:id', requireAuth,
  validate({ params: z.object({ id: uuid }), body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().min(1).max(config.MAX_PROMPT_CHARS).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    domain: z.string().max(60).optional().nullable(),
    score: z.coerce.number().int().min(0).max(30).optional().nullable(),
  }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const existing = await loadDetail(req.user.id, req.params.id);
    if (!existing) throw new HttpError(404, 'Prompt not found.', 'NOT_FOUND');
    const { title, body, tags, domain, score } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (body !== undefined && body !== existing.body) {
        const next = (existing.versions[0]?.version_no || 0) + 1;
        const v = await client.query(
          `INSERT INTO prompt_versions (prompt_id, version_no, body, score) VALUES ($1,$2,$3,$4) RETURNING id`,
          [existing.id, next, body, score ?? scorePrompt(body).overallScore]);
        await client.query(`UPDATE prompts SET current_version_id = $2 WHERE id = $1`, [existing.id, v.rows[0].id]);
      }
      await client.query(
        `UPDATE prompts SET title = COALESCE($2, title), tags = COALESCE($3, tags), domain = COALESCE($4, domain) WHERE id = $1`,
        [existing.id, title ?? null, tags ?? null, domain === undefined ? null : domain]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    res.json(await loadDetail(req.user.id, existing.id));
  })
);

router.delete('/:id', requireAuth, validate({ params: z.object({ id: uuid }) }), asyncHandler(async (req, res) => {
  needDb();
  const r = await query(`DELETE FROM prompts WHERE id = $1 AND user_id = $2 RETURNING id`, [req.params.id, req.user.id]);
  if (!r.rowCount) throw new HttpError(404, 'Prompt not found.', 'NOT_FOUND');
  res.json({ success: true });
}));

router.post('/:id/rate', requireAuth,
  validate({ params: z.object({ id: uuid }), body: z.object({
    rating: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
    reason: z.string().max(60).optional(),
  }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const r = await query(`UPDATE prompts SET rating = $3, rating_reason = $4 WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id, req.body.rating, req.body.reason || null]);
    if (!r.rowCount) throw new HttpError(404, 'Prompt not found.', 'NOT_FOUND');
    trackEvent({ eventType: 'prompt_rated', userId: req.user.id, metadata: { rating: req.body.rating, reason: req.body.reason } });
    res.json({ success: true });
  })
);

router.post('/:id/favorite', requireAuth, validate({ params: z.object({ id: uuid }) }), asyncHandler(async (req, res) => {
  needDb();
  const r = await query(`UPDATE prompts SET is_favorite = NOT is_favorite WHERE id = $1 AND user_id = $2 RETURNING is_favorite`,
    [req.params.id, req.user.id]);
  if (!r.rowCount) throw new HttpError(404, 'Prompt not found.', 'NOT_FOUND');
  res.json({ is_favorite: r.rows[0].is_favorite });
}));

export default router;
