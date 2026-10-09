import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { hasDatabase } from '../models/database.js';
import { listGenerations, getGeneration } from '../services/GenerationsService.js';
import { recordSignal } from '../services/KnowledgeService.js';

const router = Router();

/** GET /api/generations?limit=50 — the signed-in user's run history. */
router.get('/', requireAuth,
  validate({ query: z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) }) }),
  asyncHandler(async (req, res) => {
    if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
    res.json(await listGenerations(req.user.id, req.query.limit));
  })
);

router.get('/:id', requireAuth,
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
    const row = await getGeneration(req.user.id, req.params.id);
    if (!row) throw new HttpError(404, 'Generation not found.', 'NOT_FOUND');
    res.json(row);
  })
);

/**
 * POST /api/generations/:id/signal { signal: copied|opened|saved|up|down }
 * Works for guests (matched on X-Session-Id) and signed-in users. Feeds the knowledge base.
 */
router.post('/:id/signal',
  validate({ params: z.object({ id: z.string().uuid() }), body: z.object({ signal: z.enum(['copied', 'opened', 'saved', 'up', 'down']) }) }),
  asyncHandler(async (req, res) => {
    if (!hasDatabase) return res.json({ success: true, recorded: false });
    const sid = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'].slice(0, 100) : null;
    const r = await recordSignal({ generationId: req.params.id, signal: req.body.signal, userId: req.user?.id || null, sessionId: sid });
    if (!r) throw new HttpError(404, 'Generation not found.', 'NOT_FOUND');
    res.json({ success: true, recorded: true, ...r });
  })
);

export default router;
