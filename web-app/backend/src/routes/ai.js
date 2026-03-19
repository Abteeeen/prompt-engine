import { generateWithAI, generateArenaResults, generateOptimizedPrompt } from '../services/AIService.js';
import security from '../services/SecurityService.js';
import learning from '../services/LearningService.js';
import { scorePrompt } from '../services/QualityScorerService.js';
import { trackEvent } from '../services/AnalyticsService.js';
import logger from '../utils/logger.js';

// ... (keep existing imports/setup)

// POST /api/ai/arena
// Runs fleet orchestration comparing multiple models
router.post('/arena', async (req, res) => {
  const { request } = req.body;
  if (!request) return res.status(400).json({ error: 'Request required' });

  try {
    const result = await generateArenaResults(request);
    res.json(result);
  } catch (err) {
    logger.error('Arena error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/optimize
// Runs autonomous prompt optimization
router.post('/optimize', async (req, res) => {
  const { request } = req.body;
  if (!request) return res.status(400).json({ error: 'Request required' });

  try {
    const result = await generateOptimizedPrompt(request);
    res.json(result);
  } catch (err) {
    logger.error('Optimization error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/scan
// Manually triggers the Security Shield
router.post('/scan', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt text required' });

  const result = await security.scanPrompt(prompt);
  res.json(result);
});

// POST /api/ai/generate
// Body: { request: string }
// Returns: { prompt, qualityScore, model, source }
router.post('/generate', async (req, res) => {
  const { request } = req.body;

  if (!request || typeof request !== 'string' || request.trim().length < 5) {
    return res.status(400).json({ error: 'request must be at least 5 characters.' });
  }

  try {
    const result = await generateWithAI(request.trim());
    const qualityScore = scorePrompt(result.prompt);

    trackEvent({
      eventType: 'ai_prompt_generated',
      sessionId: req.headers['x-session-id'],
      userId: req.user?.id,
      qualityScore: qualityScore.overallScore,
      metadata: { 
        source: result.source, 
        requestLength: request.length,
        securityRisk: result.security?.riskLevel 
      },
    });

    // [NEW] Trigger Continuous Learning (Feature 2) — non-blocking
    if (qualityScore.overallScore >= 25) {
      learning.learnFromSuccess(request.trim(), result.prompt, qualityScore.overallScore, req.user?.id)
        .catch(err => logger.warn('Background learning failed', { error: err.message }));
    }

    res.json({ ...result, qualityScore });
  } catch (err) {
    logger.error('Generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
