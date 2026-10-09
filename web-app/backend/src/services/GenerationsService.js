import { query, hasDatabase } from '../models/database.js';
import logger from '../utils/logger.js';

/**
 * Persist one pipeline run. Returns the row id, or null when no DB / on failure.
 * Never throws: history must not break generation.
 */
export async function recordGeneration({ req, kind = 'generate', request, result, status = 'ok' }) {
  if (!hasDatabase) return null;
  try {
    const sid = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'].slice(0, 100) : null;
    const usage = result?.tokenUsage || {};
    const r = await query(
      `INSERT INTO generations
         (user_id, session_id, kind, request, prompt, domain, prompt_type, quality_score, score_method,
          analysis, issues, pipeline, provider, model, refinements, tokens_in, tokens_out, latency_ms, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING id`,
      [
        req.user?.id || null, sid, kind, request.slice(0, 8000), result?.prompt || null,
        result?.domain || null, result?.detectedType || null,
        result?.qualityScore?.overallScore ?? null, result?.qualityScore?.method || null,
        result?.analysis ? JSON.stringify(result.analysis) : null,
        result?.issues ? JSON.stringify(result.issues) : null,
        result?.pipeline ? JSON.stringify(result.pipeline) : null,
        result?.source || null, result?.model || null, result?.refinements || 0,
        usage.prompt_tokens ?? null, usage.completion_tokens ?? null, result?.latencyMs ?? null, status,
      ]
    );
    return r.rows[0].id;
  } catch (err) {
    logger.warn('Could not record generation', { error: err.message });
    return null;
  }
}

export async function listGenerations(userId, limit = 50) {
  const r = await query(
    `SELECT id, kind, request, prompt, domain, quality_score, created_at
     FROM generations WHERE user_id = $1 AND prompt IS NOT NULL
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return r.rows;
}

export async function getGeneration(userId, id) {
  const r = await query(`SELECT * FROM generations WHERE id = $1 AND user_id = $2`, [id, userId]);
  return r.rows[0] || null;
}
