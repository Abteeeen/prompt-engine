import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { hasDatabase } from '../models/database.js';
import { getProfile, upsertProfile } from '../services/ProfileService.js';

const router = Router();
const field = z.string().max(4000).default('');

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
  res.json(await getProfile(req.user.id));
}));

router.put('/', requireAuth,
  validate({ body: z.object({ brand_voice: field, product_facts: field, audience: field, constraints: field }) }),
  asyncHandler(async (req, res) => {
    if (!hasDatabase) throw new HttpError(503, 'Database not configured.', 'NO_DATABASE');
    res.json(await upsertProfile(req.user.id, req.body));
  })
);

export default router;
