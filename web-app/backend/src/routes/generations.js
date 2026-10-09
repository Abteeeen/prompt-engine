import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { hasDatabase } from '../models/database.js';
import { listGenerations, getGeneration } from '../services/GenerationsService.js';

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

export default router;
