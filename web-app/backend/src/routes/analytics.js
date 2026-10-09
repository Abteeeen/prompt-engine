import { Router } from 'express';
import { z } from 'zod';
import { trackEvent, getDashboardStats } from '../services/AnalyticsService.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Only events the frontend is known to send. Anything else is dropped silently.
const ALLOWED_EVENTS = new Set([
  'page_view', 'template_viewed', 'template_selected', 'prompt_copied', 'prompt_edited',
  'prompt_saved', 'open_in_chatgpt', 'open_in_claude', 'question_answered', 'feedback_opened',
  'sign_in', 'sign_out', 'prompt_rated',
]);

router.post('/event',
  validate({ body: z.object({
    event: z.string().max(60),
    templateId: z.string().max(60).optional().nullable(),
    sessionId: z.string().max(100).optional().nullable(),
    metadata: z.record(z.unknown()).optional(),
  }) }),
  asyncHandler(async (req, res) => {
    const { event, templateId, sessionId, metadata } = req.body;
    if (ALLOWED_EVENTS.has(event)) {
      const small = JSON.stringify(metadata || {}).length <= 1000 ? metadata : { truncated: true };
      await trackEvent({ eventType: event, templateId, userId: req.user?.id || null, sessionId, metadata: small });
    }
    res.json({ success: true });
  })
);

router.get('/dashboard', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.json(await getDashboardStats());
}));

export default router;
