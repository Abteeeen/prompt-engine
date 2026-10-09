import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { query, hasDatabase } from '../models/database.js';
import { knowledgeStats, upsertExemplar, scrub } from '../services/KnowledgeService.js';
import { providerStatus } from '../services/llm/providers.js';

const router = Router();
router.use(requireAuth, requireAdmin);
const needDb = () => { if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE'); };

/** GET /api/admin/knowledge — size of the knowledge base and whether retrieval is helping. */
router.get('/knowledge', asyncHandler(async (req, res) => { needDb(); res.json(await knowledgeStats()); }));

/** GET /api/admin/knowledge/exemplars?domain=&source= — browse the pool for curation. */
router.get('/knowledge/exemplars',
  validate({ query: z.object({ domain: z.string().max(60).optional(), source: z.enum(['seed', 'user', 'admin']).optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const { domain, source, limit } = req.query;
    const r = await query(
      `SELECT id, source, domain, request, left(prompt, 400) AS prompt_preview, score, signals, uses, active, embed_model, created_at
       FROM exemplars WHERE ($1::text IS NULL OR domain = $1) AND ($2::text IS NULL OR source = $2)
       ORDER BY created_at DESC LIMIT $3`, [domain || null, source || null, limit]);
    res.json(r.rows);
  })
);

/** POST /api/admin/knowledge/exemplars — add a hand-written expert example. */
router.post('/knowledge/exemplars',
  validate({ body: z.object({ domain: z.string().max(60).optional(), promptType: z.string().max(30).optional(), request: z.string().min(5).max(2000), prompt: z.string().min(50).max(20000), score: z.coerce.number().int().min(0).max(30).optional() }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const id = await upsertExemplar({ source: 'admin', ...req.body, request: scrub(req.body.request), prompt: scrub(req.body.prompt) });
    res.status(201).json({ id });
  })
);

/** PATCH /api/admin/knowledge/exemplars/:id { active } — hide or restore an example. */
router.patch('/knowledge/exemplars/:id',
  validate({ params: z.object({ id: z.string().uuid() }), body: z.object({ active: z.boolean() }) }),
  asyncHandler(async (req, res) => {
    needDb();
    const r = await query(`UPDATE exemplars SET active = $2 WHERE id = $1 RETURNING id, active`, [req.params.id, req.body.active]);
    if (!r.rowCount) throw new HttpError(404, 'Exemplar not found.', 'NOT_FOUND');
    res.json(r.rows[0]);
  })
);

/** GET /api/admin/providers — live LLM provider and key cooldown state (no key values). */
router.get('/providers', (req, res) => res.json(providerStatus()));

export default router;
