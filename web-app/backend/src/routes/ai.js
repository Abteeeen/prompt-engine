import { Router } from 'express';
import { z } from 'zod';
import { generateWithAI, generateOptimizedPrompt, refineWithAnswers } from '../services/AIService.js';
import { providerStatus } from '../services/llm/providers.js';
import { scorePrompt } from '../services/QualityScorerService.js';
import { trackEvent } from '../services/AnalyticsService.js';
import { enforceQuota, recordUsage } from '../services/QuotaService.js';
import { buildContextBlock } from '../services/ProfileService.js';
import { recordGeneration } from '../services/GenerationsService.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { config } from '../config.js';
import logger from '../utils/logger.js';

const router = Router();

const requestField = z.string().trim().min(5, 'Describe what you need in at least 5 characters.').max(config.MAX_REQUEST_CHARS);

/** Strip the model-facing pieces the client does not need. */
function toResponse(result, id, usage) {
  const { tokenUsage, ...rest } = result;
  return { id, ...rest, qualityScore: result.qualityScore || scorePrompt(result.prompt), usage };
}

function failIfFallback(result) {
  if (result.source === 'template' || result.model === 'emergency-fallback') {
    logger.error('Generation produced static fallback: no LLM provider answered');
    throw new HttpError(503, 'Our models are busy right now. Please try again in a minute.', 'MODELS_UNAVAILABLE');
  }
}

// GET /api/ai/providers (admin): which providers are configured and cooling down. No key values.
router.get('/providers', requireAuth, requireAdmin, (req, res) => res.json(providerStatus()));

// POST /api/ai/generate { request, promptType? }
router.post('/generate',
  validate({ body: z.object({ request: requestField, promptType: z.string().max(20).optional() }) }),
  asyncHandler(async (req, res) => {
    await enforceQuota(req);
    const userRequest = req.body.promptType && req.body.promptType !== 'auto'
      ? `${req.body.request}\n\nPROMPT TYPE: ${req.body.promptType}`
      : req.body.request;

    const contextBlock = await buildContextBlock(req.user?.id);
    const result = await generateWithAI(userRequest, { contextBlock });
    failIfFallback(result);
    result.qualityScore = result.qualityScore || scorePrompt(result.prompt);

    const usage = await recordUsage(req, (result.tokenUsage?.prompt_tokens || 0) + (result.tokenUsage?.completion_tokens || 0));
    const id = await recordGeneration({ req, kind: 'generate', request: req.body.request, result });
    trackEvent({
      eventType: 'ai_prompt_generated', sessionId: req.headers['x-session-id'], userId: req.user?.id,
      qualityScore: result.qualityScore.overallScore,
      metadata: { source: result.source, model: result.model, scoreMethod: result.qualityScore.method, refinements: result.refinements, latencyMs: result.latencyMs, hasProfile: Boolean(contextBlock) },
    });
    res.json(toResponse(result, id, usage));
  })
);

// POST /api/ai/refine { request, prompt, answers: [{question, answer}], generationId? }
router.post('/refine',
  validate({ body: z.object({
    request: requestField,
    prompt: z.string().max(config.MAX_PROMPT_CHARS).default(''),
    answers: z.array(z.object({ question: z.string().max(500), answer: z.string().max(2000) })).min(1).max(8),
    generationId: z.string().uuid().optional().nullable(),
  }) }),
  asyncHandler(async (req, res) => {
    await enforceQuota(req);
    const contextBlock = await buildContextBlock(req.user?.id);
    const result = await refineWithAnswers({ ...req.body, contextBlock });
    failIfFallback(result);
    result.qualityScore = result.qualityScore || scorePrompt(result.prompt);

    const usage = await recordUsage(req, (result.tokenUsage?.prompt_tokens || 0) + (result.tokenUsage?.completion_tokens || 0));
    const id = await recordGeneration({ req, kind: 'refine', request: req.body.request, result });
    trackEvent({ eventType: 'question_answered', userId: req.user?.id, sessionId: req.headers['x-session-id'], metadata: { answers: req.body.answers.length } });
    res.json(toResponse(result, id, usage));
  })
);

// POST /api/ai/optimize { request }
router.post('/optimize',
  validate({ body: z.object({ request: z.string().trim().min(5).max(config.MAX_PROMPT_CHARS) }) }),
  asyncHandler(async (req, res) => {
    await enforceQuota(req);
    const contextBlock = await buildContextBlock(req.user?.id);
    const result = await generateOptimizedPrompt(req.body.request, { contextBlock });
    const usage = await recordUsage(req, (result.tokenUsage?.prompt_tokens || 0) + (result.tokenUsage?.completion_tokens || 0));
    const id = await recordGeneration({ req, kind: 'optimize', request: req.body.request,
      result: { prompt: result.optimized, qualityScore: result.qualityScore, issues: result.issues, pipeline: result.pipeline, source: result.provider, model: result.model, refinements: result.refinements, tokenUsage: result.tokenUsage } });
    const { tokenUsage, ...rest } = result;
    res.json({ id, ...rest, qualityScore: result.qualityScore || scorePrompt(result.optimized), usage });
  })
);

export default router;
