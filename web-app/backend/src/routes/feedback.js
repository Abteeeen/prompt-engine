import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { query, hasDatabase } from '../models/database.js';
import logger from '../utils/logger.js';

const router = Router();

router.post('/',
  validate({ body: z.object({
    message: z.string().trim().min(2).max(4000),
    email: z.string().trim().email().max(255).optional().or(z.literal('')),
    page: z.string().max(200).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
  }) }),
  asyncHandler(async (req, res) => {
    const { message, email, page, rating } = req.body;
    const sid = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'].slice(0, 100) : null;
    if (hasDatabase) {
      await query(
        `INSERT INTO feedback (user_id, session_id, email, page, rating, message) VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.user?.id || null, sid, email || null, page || null, rating ?? null, message]
      );
    } else {
      logger.info('Feedback (no database)', { page, rating, length: message.length });
    }
    res.json({ success: true });
  })
);

export default router;
