import logger from '../../utils/logger.js';

/**
 * Text embeddings for semantic retrieval. Optional: when nothing is configured,
 * embed() returns null and retrieval uses Postgres keyword search only.
 *
 * Provider choice (EMBED_PROVIDER, default "auto" = first configured in this order):
 *   cloudflare  @cf/baai/bge-m3 on Workers AI   (free 10K neurons/day, does not train on data)
 *   gemini      gemini-embedding-001             (free tier; Google may train on free-tier data)
 *   openai      any OpenAI-compatible /embeddings endpoint (EMBED_BASE_URL + EMBED_API_KEY)
 *   huggingface feature-extraction via the HF router (tiny free credit)
 *
 * Vectors from different models are never compared: rows store embed_model and queries filter on it.
 */

const TIMEOUT_MS = parseInt(process.env.EMBED_TIMEOUT_MS || '8000', 10);

function cfAccount() { return process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID; }
function cfToken() { return process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN; }

const PROVIDERS = {
  cloudflare: {
    configured: () => Boolean(cfAccount() && cfToken()),
    model: () => process.env.EMBED_MODEL_CLOUDFLARE || '@cf/baai/bge-m3',
    async embed(texts, model) {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`cloudflare embeddings HTTP ${res.status}`);
      const data = await res.json();
      return data?.result?.data;
    },
  },
  gemini: {
    configured: () => Boolean(process.env.GEMINI_API_KEY),
    model: () => process.env.EMBED_MODEL_GEMINI || 'gemini-embedding-001',
    async embed(texts, model) {
      const key = process.env.GEMINI_API_KEY.split(',')[0].trim();
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/embeddings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, input: texts, dimensions: 768 }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`gemini embeddings HTTP ${res.status}`);
      const data = await res.json();
      return data?.data?.map(d => d.embedding);
    },
  },
  openai: {
    configured: () => Boolean(process.env.EMBED_BASE_URL),
    model: () => process.env.EMBED_MODEL || 'text-embedding-3-small',
    async embed(texts, model) {
      const res = await fetch(`${process.env.EMBED_BASE_URL.replace(/\/$/, '')}/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(process.env.EMBED_API_KEY && { Authorization: `Bearer ${process.env.EMBED_API_KEY}` }) },
        body: JSON.stringify({ model, input: texts }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`embeddings HTTP ${res.status}`);
      const data = await res.json();
      return data?.data?.map(d => d.embedding);
    },
  },
  huggingface: {
    configured: () => Boolean(process.env.HF_TOKEN),
    model: () => process.env.EMBED_MODEL_HF || 'BAAI/bge-m3',
    async embed(texts, model) {
      const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN.split(',')[0].trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: texts }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`huggingface embeddings HTTP ${res.status}`);
      return res.json();
    },
  },
};

const ORDER = ['cloudflare', 'gemini', 'openai', 'huggingface'];

/** The active embedding provider name, or null when none is configured / disabled. */
export function embeddingProvider() {
  const choice = (process.env.EMBED_PROVIDER || 'auto').toLowerCase();
  if (choice === 'none' || choice === 'off') return null;
  if (choice !== 'auto') return PROVIDERS[choice]?.configured() ? choice : null;
  return ORDER.find(name => PROVIDERS[name].configured()) || null;
}

/** "<provider>:<model>" for the active provider, or null. Stored on rows as embed_model. */
export function embeddingModelId() {
  const p = embeddingProvider();
  return p ? `${p}:${PROVIDERS[p].model()}` : null;
}

// Short cooldown after a failure so a broken embedding key does not add latency to every request.
let coolUntil = 0;

/**
 * Embed up to ~32 short texts. Returns { model, vectors } or null. Never throws.
 */
export async function embed(texts) {
  const p = embeddingProvider();
  if (!p || !texts?.length || Date.now() < coolUntil) return null;
  const model = PROVIDERS[p].model();
  try {
    const vectors = await PROVIDERS[p].embed(texts.map(t => String(t).slice(0, 2000)), model);
    if (!Array.isArray(vectors) || vectors.length !== texts.length || !Array.isArray(vectors[0])) {
      throw new Error('unexpected embeddings response shape');
    }
    return { model: `${p}:${model}`, vectors };
  } catch (err) {
    coolUntil = Date.now() + 5 * 60 * 1000;
    logger.warn('Embedding call failed; keyword retrieval only for 5 minutes', { provider: p, error: err.message });
    return null;
  }
}

/** pgvector text literal for a JS number array. */
export function toVectorLiteral(vec) {
  return `[${vec.map(n => (Number.isFinite(n) ? n : 0)).join(',')}]`;
}

export function _resetEmbeddingCooldown() { coolUntil = 0; }
