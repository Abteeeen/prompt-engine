import { Router } from 'express';
import { generatePrompt } from '../services/PromptGeneratorService.js';
import { scorePrompt } from '../services/QualityScorerService.js';
import { trackEvent } from '../services/AnalyticsService.js';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../models/database.js';
import { ingestPrompt } from '../services/AIService.js';
import { checkGenerationQuota } from '../services/QuotaService.js';

const router = Router();

// GET /api/prompts/quota — return current user/guest quota usage
router.get('/quota', async (req, res) => {
  const quota = await checkGenerationQuota(req);
  res.json(quota);
});

// POST /api/prompts/generate — generate prompt from template + form data
router.post('/generate', async (req, res) => {
  const { templateId, formData, options } = req.body;

  if (!templateId || typeof formData !== 'object') {
    return res.status(400).json({ error: 'templateId and formData are required.' });
  }

  // 1. Check Quota
  const quota = await checkGenerationQuota(req);
  if (!quota.allowed) {
    return res.status(429).json({ 
      error: 'Daily limit reached.', 
      message: 'You have used your 15 free generations for today. Please sign in to continue.',
      quota 
    });
  }

  // 2. Parse Slash Commands from formData.topic (if exists)
  let topic = formData.topic || '';
  let commandDetected = null;
  if (topic.startsWith('/improve ')) {
    commandDetected = 'improve';
    formData.topic = topic.replace('/improve ', '').trim();
    // In the future, this could route to a completely different agent/template
  } else if (topic.startsWith('/expand ')) {
    commandDetected = 'expand';
    formData.topic = topic.replace('/expand ', '').trim();
  }

  // 3. Generate Prompt (Sync for now, simulating expansion via LLM options)
  const result = generatePrompt(templateId, formData, { ...options, command: commandDetected });
  if (!result) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  const scored = scorePrompt(result.prompt);

  trackEvent({
    eventType: 'prompt_generated',
    templateId,
    sessionId: req.headers['x-session-id'],
    userId: req.user?.id,
    qualityScore: scored.overallScore,
    ipAddress: req.ip || req.connection.remoteAddress,
    metadata: { command: commandDetected }
  });

  // Return generated prompt with quota limits attached
  res.json({ ...result, qualityScore: scored, quota });
});


// POST /api/prompts/save — save a generated prompt to the user's library
router.post('/save', requireAuth, async (req, res) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database not configured — saving prompts is disabled.' });
  const { templateId, name, promptText, qualityScore, tags } = req.body;

  if (!promptText) {
    return res.status(400).json({ error: 'promptText is required.' });
  }

  const result = await query(
    `INSERT INTO user_prompts (user_id, template_id, name, prompt_text, quality_score, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [req.user.id, templateId || null, name || 'Untitled Prompt', promptText,
     qualityScore || null, tags || []]
  );

  trackEvent({ eventType: 'prompt_saved', templateId, userId: req.user.id, qualityScore });

  res.status(201).json({ id: result.rows[0].id, savedAt: result.rows[0].created_at });
});

// GET /api/prompts — list current user's saved prompts
router.get('/', requireAuth, async (req, res) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database not configured — prompt library is disabled.' });
  const { sort = 'created_at', tag } = req.query;

  const allowed = ['created_at', 'quality_score', 'last_used_at'];
  const sortCol = allowed.includes(sort) ? sort : 'created_at';

  let sql = `
    SELECT id, template_id, name, quality_score, tags, rating, usage_count, created_at, last_used_at
    FROM user_prompts
    WHERE user_id = $1
  `;
  const params = [req.user.id];

  if (tag) {
    sql += ` AND $2 = ANY(tags)`;
    params.push(tag);
  }

  sql += ` ORDER BY ${sortCol} DESC`;

  const result = await query(sql, params);
  res.json(result.rows);
});

// DELETE /api/prompts/:id — delete a saved prompt
router.delete('/:id', requireAuth, async (req, res) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database not configured — prompt library is disabled.' });
  const result = await query(
    `DELETE FROM user_prompts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Prompt not found.' });
  }
  res.json({ success: true });
});

// POST /api/prompts/:id/rate — rate a saved prompt (yes/no/okay)
router.post('/:id/rate', requireAuth, async (req, res) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database not configured — rating is disabled.' });
  const { rating } = req.body;
  if (!['yes', 'no', 'okay'].includes(rating)) {
    return res.status(400).json({ error: 'rating must be "yes", "no", or "okay".' });
  }

  const result = await query(
    `UPDATE user_prompts
     SET rating = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING id`,
    [rating, req.params.id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Prompt not found.' });
  }
  res.json({ success: true });
});

// POST /api/prompts/seed — used by n8n to ingest new high-quality prompts
router.post('/seed', async (req, res) => {
  const seedKey = req.headers['x-seed-key'];
  const masterKey = process.env.SEED_API_KEY || 'development_seed_key_123';
  
  if (!seedKey || seedKey !== masterKey) {
    return res.status(401).json({ error: 'Unauthorized seed attempt.' });
  }

  const { user_idea, perfect_prompt, domain } = req.body;
  if (!user_idea || !perfect_prompt) {
    return res.status(400).json({ error: 'user_idea and perfect_prompt are required.' });
  }

  try {
    await ingestPrompt({ user_idea, perfect_prompt, domain });
    res.json({ success: true, message: 'Prompt ingested and embedded successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
