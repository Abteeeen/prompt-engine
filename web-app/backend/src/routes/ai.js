import { Router } from 'express';
import { generateWithAI } from '../services/AIService.js';
import { scorePrompt } from '../services/QualityScorerService.js';
import { trackEvent } from '../services/AnalyticsService.js';
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
let extractor = null;
async function getExtractor() {
  if (!extractor) extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return extractor;
}

const router = Router();

// POST /api/ai/feedback
router.post('/feedback', async (req, res) => {
  const { request, prompt, rating } = req.body;
  if (!request || !prompt || rating !== 'up') return res.json({ success: true });

  try {
    const fn = await getExtractor();
    const output = await fn(request, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    
    await supabase.from('gold_standard_prompts').insert([{ user_idea: request, perfect_prompt: prompt, domain: 'user-feedback', embedding }]);
    res.json({ success: true });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// POST /api/ai/generate
// Body: { request: string }
// Returns: { prompt, qualityScore, model, source }
router.post('/generate', async (req, res) => {
  const { request } = req.body;

  if (!request || typeof request !== 'string' || request.trim().length < 5) {
    return res.status(400).json({ error: 'request must be at least 5 characters.' });
  }
  if (request.length > 1000) {
    return res.status(400).json({ error: 'request must be 1000 characters or fewer.' });
  }

  const result = await generateWithAI(request.trim());
  const qualityScore = scorePrompt(result.prompt);

  trackEvent({
    eventType: 'ai_prompt_generated',
    sessionId: req.headers['x-session-id'],
    userId: req.user?.id,
    qualityScore: qualityScore.overallScore,
    metadata: { source: result.source, requestLength: request.length },
  });

  res.json({ ...result, qualityScore });
});

export default router;
