import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, hasDatabase } from '../models/database.js';
import { embed, embeddingModelId, toVectorLiteral } from './llm/embeddings.js';
import logger from '../utils/logger.js';

/**
 * Retrieval-augmented generation over proven prompts.
 *
 *   retrieveContext()  → before drafting, fetch the closest proven examples (shared pool)
 *                        and the user's own best library prompts (private), formatted for
 *                        the drafter's "SUCCESSFUL EXAMPLE PROMPTS" slot.
 *   recordSignal()     → a user copied / opened / saved / rated a generation. Positive
 *                        signals on a well-scored generation promote it into the pool;
 *                        negative signals demote it.
 *   seedExemplars()    → load the hand-written expert examples on boot (idempotent).
 *
 * Ranking fuses keyword (Postgres full-text) and, when an embedding provider is configured,
 * vector similarity with reciprocal rank fusion, then prefers same-domain, higher-scored,
 * more-endorsed examples.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.join(__dirname, '../../seeds/exemplars.json');

export const PROMOTE_MIN_SCORE = parseInt(process.env.RAG_PROMOTE_MIN_SCORE || '26', 10);
const RAG_ENABLED = process.env.RAG_ENABLED !== 'false';
const MAX_EXAMPLES = parseInt(process.env.RAG_MAX_EXAMPLES || '2', 10);
const EXAMPLE_CHARS = parseInt(process.env.RAG_EXAMPLE_CHARS || '1600', 10);

let vectorColumn = null; // cached: does exemplars.embedding exist?

async function hasVectorColumn() {
  if (vectorColumn !== null) return vectorColumn;
  try {
    const r = await query(`SELECT 1 FROM information_schema.columns WHERE table_name = 'exemplars' AND column_name = 'embedding'`);
    vectorColumn = r.rowCount > 0;
  } catch { vectorColumn = false; }
  return vectorColumn;
}

// ── Text helpers ─────────────────────────────────────────────────────────────
const STOPWORDS = new Set(('a an and are as at be but by for from has have i in into is it its me my of on or our so that the their them then there these this to us was we what when which who will with you your write create make give help need want please about some can could would should do get').split(' '));

/** Keywords for an OR-style full-text query. Only [a-z0-9] survives, so it is safe for to_tsquery. */
export function keywordQuery(text, max = 12) {
  const words = String(text).toLowerCase().match(/[a-z0-9]+/g) || [];
  const seen = new Set();
  const out = [];
  for (const w of words) {
    if (w.length < 3 || STOPWORDS.has(w) || seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= max) break;
  }
  return out.join(' | ');
}

/** Remove obvious personal data before anything enters the shared pool. */
export function scrub(text) {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[URL]')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '[PHONE]')
    .replace(/\b(?:sk|pk|gsk|hf|ghp|xox[bap])[-_][A-Za-z0-9_-]{12,}\b/g, '[SECRET]')
    .replace(/\b\d{9,}\b/g, '[NUMBER]');
}

export function contentHash(request, prompt) {
  return createHash('sha256').update(`${String(request).trim().toLowerCase()}\n${String(prompt).trim()}`).digest('hex');
}

/** Reciprocal rank fusion of several ranked id lists. */
export function fuseRanks(lists, k = 60) {
  const scores = new Map();
  for (const list of lists) {
    list.forEach((id, i) => scores.set(id, (scores.get(id) || 0) + 1 / (k + i + 1)));
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id, s]) => ({ id, score: s }));
}

function formatExample(i, ex, label) {
  const prompt = ex.prompt.length > EXAMPLE_CHARS ? `${ex.prompt.slice(0, EXAMPLE_CHARS)}\n[...]` : ex.prompt;
  const meta = [label, ex.domain && `domain ${ex.domain}`, ex.score != null && `scored ${ex.score}/30`].filter(Boolean).join(', ');
  return `EXAMPLE ${i} (${meta})\nRough idea: "${ex.request.slice(0, 300)}"\nExpert prompt:\n${prompt}`;
}

// ── Retrieval ────────────────────────────────────────────────────────────────

async function searchShared({ request, domain, limit = 12 }) {
  const kw = keywordQuery(`${request} ${domain || ''}`);
  const lists = [];
  const rows = new Map();

  if (kw) {
    const r = await query(
      `SELECT id, domain, request, prompt, score, signals, source
       FROM exemplars, to_tsquery('english', $1) q
       WHERE active AND tsv @@ q
       ORDER BY ts_rank_cd(tsv, q) DESC LIMIT $2`, [kw, limit]);
    r.rows.forEach(x => rows.set(x.id, x));
    lists.push(r.rows.map(x => x.id));
  }

  if (await hasVectorColumn()) {
    const e = await embed([request]);
    if (e) {
      const r = await query(
        `SELECT id, domain, request, prompt, score, signals, source
         FROM exemplars WHERE active AND embed_model = $2 AND embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector LIMIT $3`, [toVectorLiteral(e.vectors[0]), e.model, limit]);
      r.rows.forEach(x => rows.set(x.id, x));
      lists.push(r.rows.map(x => x.id));
    }
  }

  if (domain) {
    const r = await query(
      `SELECT id, domain, request, prompt, score, signals, source FROM exemplars
       WHERE active AND domain = $1 ORDER BY signals DESC, score DESC NULLS LAST LIMIT 4`, [domain]);
    r.rows.forEach(x => rows.set(x.id, x));
    lists.push(r.rows.map(x => x.id));
  }

  return fuseRanks(lists)
    .map(({ id, score }) => {
      const x = rows.get(id);
      const quality = ((x.score ?? 24) - 24) * 0.002 + Math.min(x.signals, 10) * 0.001;
      const sameDomain = domain && x.domain === domain ? 0.01 : 0;
      return { ...x, rank: score + quality + sameDomain };
    })
    .sort((a, b) => b.rank - a.rank);
}

async function searchPersonal({ userId, request, domain }) {
  if (!userId) return [];
  const kw = keywordQuery(request);
  const r = await query(
    `SELECT p.id, p.title AS request, v.body AS prompt, p.domain, v.score,
            CASE WHEN $3 <> '' THEN ts_rank_cd(to_tsvector('english', p.title || ' ' || left(v.body, 4000)), to_tsquery('english', $3)) ELSE 0 END AS rel
     FROM prompts p JOIN prompt_versions v ON v.id = p.current_version_id
     WHERE p.user_id = $1 AND (p.rating = 1 OR p.is_favorite)
       AND ($2::text IS NULL OR p.domain = $2 OR ($3 <> '' AND to_tsvector('english', p.title || ' ' || left(v.body, 4000)) @@ to_tsquery('english', $3)))
     ORDER BY rel DESC, p.updated_at DESC LIMIT 1`,
    [userId, domain || null, kw]);
  return r.rows;
}

/**
 * Build the drafter's example block. Returns { text, used: [ids] }. Never throws.
 */
export async function retrieveContext({ request, domain = null, userId = null }) {
  if (!RAG_ENABLED || !hasDatabase) return { text: '', used: [] };
  try {
    const [shared, personal] = await Promise.all([
      searchShared({ request, domain }),
      searchPersonal({ userId, request, domain }).catch(() => []),
    ]);
    const blocks = [];
    let i = 1;
    for (const p of personal) blocks.push(formatExample(i++, p, "from the user's own top-rated library"));
    const picked = shared.slice(0, MAX_EXAMPLES);
    for (const s of picked) blocks.push(formatExample(i++, s, s.source === 'seed' ? 'curated expert example' : 'proven with real users'));
    const used = picked.map(s => s.id);
    if (used.length) query(`UPDATE exemplars SET uses = uses + 1 WHERE id = ANY($1::uuid[])`, [used]).catch(() => {});
    return { text: blocks.join('\n\n---\n\n'), used, personal: personal.length };
  } catch (err) {
    logger.warn('Retrieval failed; drafting without examples', { error: err.message });
    return { text: '', used: [] };
  }
}

// ── Learning loop ────────────────────────────────────────────────────────────

const POSITIVE = new Set(['copied', 'opened', 'saved', 'up']);

/**
 * Record a user signal on a generation and promote/demote the knowledge base.
 * `owner` is { userId } or { sessionId }; the generation must belong to it.
 * Returns { promoted, demoted } or null when the generation is not found.
 */
export async function recordSignal({ generationId, signal, userId = null, sessionId = null }) {
  const r = await query(
    `SELECT g.id, g.request, g.prompt, g.domain, g.prompt_type, g.quality_score, g.status, g.user_id, g.promoted,
            COALESCE(u.share_examples, TRUE) AS share
     FROM generations g LEFT JOIN users u ON u.id = g.user_id
     WHERE g.id = $1 AND ((g.user_id IS NOT NULL AND g.user_id = $2) OR (g.user_id IS NULL AND $3::text IS NOT NULL AND g.session_id = $3))`,
    [generationId, userId, sessionId]);
  const g = r.rows[0];
  if (!g) return null;

  if (signal === 'copied' || signal === 'opened') await query(`UPDATE generations SET copied = TRUE WHERE id = $1`, [g.id]);
  if (signal === 'up' || signal === 'down') await query(`UPDATE generations SET feedback = $2 WHERE id = $1`, [g.id, signal === 'up' ? 1 : -1]);

  if (signal === 'down') {
    const d = await query(
      `UPDATE exemplars SET signals = signals - 2, active = (signals - 2) > 0 WHERE generation_id = $1 AND source = 'user' RETURNING id`, [g.id]);
    return { promoted: false, demoted: d.rowCount > 0 };
  }

  if (!POSITIVE.has(signal)) return { promoted: false, demoted: false };
  if (!g.share || !g.prompt || g.status !== 'ok' || (g.quality_score ?? 0) < PROMOTE_MIN_SCORE) return { promoted: false, demoted: false };

  if (g.promoted) {
    await query(`UPDATE exemplars SET signals = signals + 1 WHERE generation_id = $1`, [g.id]);
    return { promoted: false, demoted: false };
  }
  const id = await upsertExemplar({
    source: 'user', domain: g.domain, promptType: g.prompt_type,
    request: scrub(g.request), prompt: scrub(g.prompt), score: g.quality_score, generationId: g.id,
  });
  await query(`UPDATE generations SET promoted = TRUE WHERE id = $1`, [g.id]);
  return { promoted: Boolean(id), demoted: false };
}

export async function upsertExemplar({ source, domain, promptType, request, prompt, score, generationId = null }) {
  const hash = contentHash(request, prompt);
  const r = await query(
    `INSERT INTO exemplars (source, domain, prompt_type, request, prompt, score, generation_id, content_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (content_hash) DO UPDATE SET signals = exemplars.signals + 1, active = TRUE
     RETURNING id, (xmax = 0) AS inserted`,
    [source, domain || null, promptType || null, request, prompt, score ?? null, generationId, hash]);
  const row = r.rows[0];
  if (row?.inserted) embedRows([row.id]).catch(() => {});
  return row?.id || null;
}

/** Compute and store embeddings for the given rows (or a batch of rows still missing one). */
export async function embedRows(ids = null, batch = 16) {
  if (!(await hasVectorColumn())) return 0;
  const model = embeddingModelId();
  if (!model) return 0;
  const r = ids
    ? await query(`SELECT id, request, domain FROM exemplars WHERE id = ANY($1::uuid[])`, [ids])
    : await query(`SELECT id, request, domain FROM exemplars WHERE active AND (embed_model IS DISTINCT FROM $1 OR embedding IS NULL) LIMIT $2`, [model, batch]);
  if (!r.rows.length) return 0;
  const e = await embed(r.rows.map(x => `${x.domain ? x.domain + ': ' : ''}${x.request}`));
  if (!e) return 0;
  for (let i = 0; i < r.rows.length; i++) {
    await query(`UPDATE exemplars SET embedding = $2::vector, embed_model = $3 WHERE id = $1`,
      [r.rows[i].id, toVectorLiteral(e.vectors[i]), e.model]);
  }
  return r.rows.length;
}

/** Load seeds/exemplars.json (idempotent), then embed a first batch in the background. */
export async function seedExemplars() {
  if (!hasDatabase) return 0;
  let seeds;
  try { seeds = JSON.parse(readFileSync(SEED_FILE, 'utf8')); } catch (err) {
    logger.warn('No seed exemplars loaded', { error: err.message });
    return 0;
  }
  let added = 0;
  for (const s of seeds) {
    const hash = contentHash(s.request, s.prompt);
    const r = await query(
      `INSERT INTO exemplars (source, domain, prompt_type, request, prompt, score, signals, content_hash)
       VALUES ('seed', $1, $2, $3, $4, $5, 3, $6) ON CONFLICT (content_hash) DO NOTHING RETURNING id`,
      [s.domain, s.promptType || null, s.request, s.prompt, s.score ?? 28, hash]);
    added += r.rowCount;
  }
  if (added) logger.info(`Seeded ${added} expert exemplars`);
  // Fill embeddings gradually so boot never waits on an external API.
  (async () => { for (let i = 0; i < 10; i++) if (!(await embedRows(null, 16))) break; })().catch(() => {});
  return added;
}

export async function knowledgeStats() {
  const r = await query(
    `SELECT source, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE active)::int AS active,
            COUNT(*) FILTER (WHERE embed_model IS NOT NULL)::int AS embedded, COALESCE(SUM(uses),0)::int AS uses
     FROM exemplars GROUP BY source ORDER BY source`);
  const g = await query(
    `SELECT COUNT(*)::int AS generations, COUNT(*) FILTER (WHERE copied)::int AS copied,
            COUNT(*) FILTER (WHERE feedback = 1)::int AS up, COUNT(*) FILTER (WHERE feedback = -1)::int AS down,
            COUNT(*) FILTER (WHERE promoted)::int AS promoted,
            ROUND(AVG(quality_score) FILTER (WHERE exemplars_used > 0), 1) AS avg_score_with_examples,
            ROUND(AVG(quality_score) FILTER (WHERE COALESCE(exemplars_used,0) = 0), 1) AS avg_score_without_examples
     FROM generations WHERE created_at > NOW() - INTERVAL '30 days'`);
  return { exemplars: r.rows, last30Days: g.rows[0], vectorSearch: await hasVectorColumn(), embeddingModel: embeddingModelId() };
}

export function _resetKnowledgeCache() { vectorColumn = null; }
