import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getUsage } from '../services/QuotaService.js';

const router = Router();

/** GET /api/usage — quota for the current user or guest session. */
router.get('/', asyncHandler(async (req, res) => {
  res.json(await getUsage(req));
}));

export default router;
