import fs from 'node:fs';
import logger from '../../utils/logger.js';

/**
 * LLM provider layer with free-tier hopping.
 *
 * Every provider here speaks the OpenAI chat-completions wire format, so one
 * `chat()` covers all of them. Credentials and model choices come only from
 * environment variables (see .env.example).
 *
 * Hopping rules
 *  - A provider may have several keys: `GROQ_API_KEY=key1,key2`. Keys are used
 *    round-robin; a key that hits a quota/rate limit is put on cooldown and the
 *    next key, then the next provider, is tried automatically.
 *  - HTTP 429 / 402 / "quota" / "credits" messages → cool the key down (duration
 *    from Retry-After when present, otherwise a status-based default).
 *  - HTTP 401 / 403 → key is dead for a day (bad or revoked key).
 *  - 5xx / timeout / network → transient: short provider cooldown, move on.
 *  - Optional per-provider daily request caps: `LLM_DAILY_LIMITS=groq:14000,gemini:250`.
 *  - State is kept in memory and, if LLM_STATE_FILE is set, mirrored to a JSON
 *    file so cooldowns survive a restart.
 *
 * Model selection per pipeline role:
 *   LLM_MODEL_<ROLE> = "<provider>:<model>" | "<provider>" | "<model>"
 * Roles: RESEARCHER, DRAFTER, CRITIC, OPTIMIZER, JURY, LEARNER, DEFAULT.
 * Fallback order: LLM_PROVIDER_ORDER (comma list).
 */

const DEFAULT_TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS || '45000', 10);
const DEFAULT_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '1500', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE || '0.75');
const STATE_FILE = process.env.LLM_STATE_FILE || '';

// Order reflects verified free tiers (2026-10): biggest daily buckets first, overflow providers last.
const DEFAULT_ORDER = 'groq,gemini,cloudflare,sambanova,openrouter,mistral,cerebras,nvidia,zai,huggingface,cohere,together,custom';

// Cooldown defaults (ms) by failure class
const COOLDOWN = {
  rate: 60 * 1000,            // per-minute limit hit
  quota: 6 * 60 * 60 * 1000,  // daily/monthly quota or credits exhausted
  dead: 24 * 60 * 60 * 1000,  // invalid/revoked key
  transient: 2 * 60 * 1000,   // 5xx, timeout, network
  model: 60 * 60 * 1000,      // model not found / decommissioned on this provider
};

const url = (name, fallback) => process.env[`${name}_BASE_URL`] || fallback;

const PROVIDERS = {
  groq: {
    url: url('GROQ', 'https://api.groq.com/openai/v1/chat/completions'),
    keyEnv: 'GROQ_API_KEY',
    defaultModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',   // llama-3.3-70b left Groq's free tier in 2026
    resetTz: 'UTC',
  },
  cerebras: {
    url: url('CEREBRAS', 'https://api.cerebras.ai/v1/chat/completions'),
    keyEnv: 'CEREBRAS_API_KEY',
    defaultModel: process.env.CEREBRAS_MODEL || 'gpt-oss-120b',      // free tier requires a verified payment method
    resetTz: 'UTC',
  },
  gemini: {
    url: url('GEMINI', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'),
    keyEnv: 'GEMINI_API_KEY',
    defaultModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    resetTz: 'America/Los_Angeles',                                 // Gemini free quota resets at midnight Pacific
  },
  sambanova: {
    url: url('SAMBANOVA', 'https://api.sambanova.ai/v1/chat/completions'),
    keyEnv: 'SAMBANOVA_API_KEY',
    defaultModel: process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct',
    resetTz: 'UTC',
  },
  mistral: {
    url: url('MISTRAL', 'https://api.mistral.ai/v1/chat/completions'),
    keyEnv: 'MISTRAL_API_KEY',
    defaultModel: process.env.MISTRAL_MODEL || 'mistral-small-latest',
  },
  cloudflare: {
    url: process.env.CLOUDFLARE_BASE_URL
      || ((process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID)
        ? `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID}/ai/v1/chat/completions`
        : null),
    keyEnv: 'CLOUDFLARE_API_TOKEN',
    defaultModel: process.env.CLOUDFLARE_MODEL || '@cf/openai/gpt-oss-120b',  // about half the neurons of llama-3.3-70b per generation
    resetTz: 'UTC',
  },
  together: {
    url: url('TOGETHER', 'https://api.together.xyz/v1/chat/completions'),
    keyEnv: 'TOGETHER_API_KEY',
    defaultModel: process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo',  // paid: $5 minimum, no free tier
  },
  nvidia: {
    // NVIDIA Build (NIM): ~40 RPM, prototyping terms. Overflow only.
    url: url('NVIDIA', 'https://integrate.api.nvidia.com/v1/chat/completions'),
    keyEnv: 'NVIDIA_API_KEY',
    defaultModel: process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
  },
  zai: {
    // Z.ai GLM Flash models are priced $0 with concurrency 1. Overflow only.
    url: url('ZAI', 'https://api.z.ai/api/paas/v4/chat/completions'),
    keyEnv: 'ZAI_API_KEY',
    defaultModel: process.env.ZAI_MODEL || 'glm-4.7-flash',
  },
  huggingface: {
    url: url('HF', 'https://router.huggingface.co/v1/chat/completions'),
    keyEnv: 'HF_TOKEN',
    defaultModel: process.env.HF_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
  },
  cohere: {
    url: url('COHERE', 'https://api.cohere.ai/compatibility/v1/chat/completions'),
    keyEnv: 'COHERE_API_KEY',
    defaultModel: process.env.COHERE_MODEL || 'command-a-03-2025',
  },
  openrouter: {
    url: url('OPENROUTER', 'https://openrouter.ai/api/v1/chat/completions'),
    keyEnv: 'OPENROUTER_API_KEY',
    defaultModel: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    resetTz: 'UTC',
    headers: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'Prompt Engine',
    },
  },
  custom: {
    // Any OpenAI-compatible server you host yourself: vLLM, TGI, Ollama, LM Studio, LiteLLM.
    url: process.env.LLM_BASE_URL ? `${process.env.LLM_BASE_URL.replace(/\/$/, '')}/chat/completions` : null,
    keyEnv: 'LLM_API_KEY',
    keyOptional: true,
    defaultModel: process.env.LLM_MODEL || 'llama3.1',
  },
};

const ROLES = ['RESEARCHER', 'DRAFTER', 'CRITIC', 'OPTIMIZER', 'JURY', 'LEARNER', 'DEFAULT'];

// ── Key pool state ───────────────────────────────────────────────────────────
// state.keys[provider][index] = { cooldownUntil, reason, failures, calls, lastUsed }
// state.providers[provider]   = { cooldownUntil, reason, dayCount, dayStamp }
const state = loadState();

function loadState() {
  const empty = { keys: {}, providers: {}, rr: {} };
  if (!STATE_FILE) return empty;
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

let saveTimer = null;
function saveState() {
  if (!STATE_FILE) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.writeFileSync(STATE_FILE, JSON.stringify(state)); } catch (err) {
      logger.warn('Could not persist LLM state', { error: err.message });
    }
  }, 250);
}

const KEY_ALIASES = { CLOUDFLARE_API_TOKEN: 'CF_API_TOKEN' };

function keysFor(name) {
  const p = PROVIDERS[name];
  if (!p) return [];
  const raw = process.env[p.keyEnv] || process.env[KEY_ALIASES[p.keyEnv]] || '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0 && p.keyOptional) return [''];
  return list;
}

function keyState(name, idx) {
  state.keys[name] ||= {};
  state.keys[name][idx] ||= { cooldownUntil: 0, reason: null, failures: 0, calls: 0, lastUsed: 0 };
  return state.keys[name][idx];
}

function providerState(name) {
  state.providers[name] ||= { cooldownUntil: 0, reason: null, dayCount: 0, dayStamp: '' };
  return state.providers[name];
}

function dailyLimits() {
  const out = {};
  for (const entry of (process.env.LLM_DAILY_LIMITS || '').split(',')) {
    const [name, n] = entry.split(':').map(s => s?.trim());
    if (name && n && Number.isFinite(Number(n))) out[name] = Number(n);
  }
  return out;
}

function todayStamp() { return new Date().toISOString().slice(0, 10); }

function dailyExhausted(name) {
  const limit = dailyLimits()[name];
  if (!limit) return false;
  const ps = providerState(name);
  if (ps.dayStamp !== todayStamp()) { ps.dayStamp = todayStamp(); ps.dayCount = 0; }
  return ps.dayCount >= limit;
}

function countCall(name) {
  const ps = providerState(name);
  if (ps.dayStamp !== todayStamp()) { ps.dayStamp = todayStamp(); ps.dayCount = 0; }
  ps.dayCount += 1;
}

export function isConfigured(name) {
  const p = PROVIDERS[name];
  if (!p || !p.url) return false;
  return keysFor(name).length > 0;
}

/** Providers that have credentials, in fallback order (configured ones only). */
export function configuredProviders() {
  const order = (process.env.LLM_PROVIDER_ORDER || DEFAULT_ORDER).split(',').map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const result = [];
  for (const name of [...order, ...Object.keys(PROVIDERS)]) {
    if (!seen.has(name) && isConfigured(name)) { seen.add(name); result.push(name); }
  }
  return result;
}

/** Providers that are configured AND currently usable (not cooling down, not over daily cap). */
export function availableProviders(now = Date.now()) {
  return configuredProviders().filter(name => {
    const ps = providerState(name);
    if (ps.cooldownUntil > now) return false;
    if (dailyExhausted(name)) return false;
    return keysFor(name).some((_, i) => keyState(name, i).cooldownUntil <= now);
  });
}

/** Pick the next healthy key index for a provider, round-robin. Returns -1 if none. */
function pickKey(name, now = Date.now()) {
  const keys = keysFor(name);
  if (keys.length === 0) return -1;
  const start = (state.rr[name] || 0) % keys.length;
  for (let n = 0; n < keys.length; n++) {
    const idx = (start + n) % keys.length;
    if (keyState(name, idx).cooldownUntil <= now) {
      state.rr[name] = idx + 1;
      return idx;
    }
  }
  return -1;
}

/** Resolve "<provider>:<model>" | "<provider>" | "<model>" into { provider, model }. */
export function resolveModel(role = 'DEFAULT') {
  const key = ROLES.includes(role.toUpperCase()) ? role.toUpperCase() : 'DEFAULT';
  const spec = process.env[`LLM_MODEL_${key}`] || process.env.LLM_MODEL_DEFAULT || '';
  const configured = configuredProviders();
  if (configured.length === 0) return null;

  if (spec) {
    const idx = spec.indexOf(':');
    const head = idx === -1 ? spec : spec.slice(0, idx);
    const tail = idx === -1 ? '' : spec.slice(idx + 1);
    if (PROVIDERS[head]) {
      if (isConfigured(head)) return { provider: head, model: tail || PROVIDERS[head].defaultModel };
      logger.warn(`LLM_MODEL_${key} names provider "${head}" but it has no credentials; falling back`);
    } else {
      return { provider: configured[0], model: spec };
    }
  }
  return { provider: configured[0], model: PROVIDERS[configured[0]].defaultModel };
}

/** Parse ARENA_MODELS="groq:llama-3.3-70b-versatile,gemini:gemini-2.5-flash". */
export function arenaModels() {
  const spec = process.env.ARENA_MODELS;
  if (spec) {
    return spec.split(',').map(s => s.trim()).filter(Boolean).map(entry => {
      const idx = entry.indexOf(':');
      const provider = idx === -1 ? entry : entry.slice(0, idx);
      const model = idx === -1 ? PROVIDERS[provider]?.defaultModel : entry.slice(idx + 1);
      return { provider, model, name: `${model} (${provider})` };
    }).filter(m => PROVIDERS[m.provider] && isConfigured(m.provider));
  }
  return configuredProviders().slice(0, 4).map(provider => ({
    provider,
    model: PROVIDERS[provider].defaultModel,
    name: `${PROVIDERS[provider].defaultModel} (${provider})`,
  }));
}

// ── Error classification ─────────────────────────────────────────────────────
const DAILY_RE = /per ?day|perday|daily|\bTPD\b|\bRPD\b|tokens per day|requests per day|free-models-per-day/i;
const MINUTE_RE = /per ?minute|perminute|\bTPM\b|\bRPM\b/i;
const QUOTA_RE = /quota|credit|billing|insufficient|exceeded.*(day|daily|month)|per day|daily limit|monthly limit|usage limit|out of tokens|payment/i;

/** Milliseconds until the next local midnight in `tz`, plus five minutes of slack. */
export function msUntilReset(tz = 'UTC', now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(now).map(p => [p.type, p.value]));
  const elapsed = ((Number(parts.hour) % 24) * 3600 + Number(parts.minute) * 60 + Number(parts.second)) * 1000;
  return 24 * 3600 * 1000 - elapsed + 5 * 60 * 1000;
}
const MODEL_RE = /model.*(not found|does not exist|decommissioned|deprecated|unavailable|not supported)|no such model|invalid model/i;

function classify(status, message, retryAfterSec, provider = null) {
  if (status === 401 || status === 403) return { kind: 'dead', ms: COOLDOWN.dead };
  if (status === 402) return { kind: 'quota', ms: COOLDOWN.quota };
  if (status === 429) {
    // Daily bucket exhausted: park the key until the provider's own reset time.
    if (DAILY_RE.test(message)) return { kind: 'daily', ms: msUntilReset(PROVIDERS[provider]?.resetTz || 'UTC') };
    if (retryAfterSec) return { kind: 'rate', ms: Math.min(Math.max(retryAfterSec, 10) * 1000, COOLDOWN.quota) };
    if (MINUTE_RE.test(message)) return { kind: 'rate', ms: COOLDOWN.rate };
    return QUOTA_RE.test(message) ? { kind: 'quota', ms: COOLDOWN.quota } : { kind: 'rate', ms: COOLDOWN.rate };
  }
  if (status === 400 || status === 404) {
    if (MODEL_RE.test(message)) return { kind: 'model', ms: COOLDOWN.model };
    return { kind: 'request', ms: 0 }; // our fault (bad input); do not punish the key
  }
  if (status === 0 || status >= 500) return { kind: 'transient', ms: COOLDOWN.transient };
  return { kind: 'other', ms: 0 };
}

function penalize(name, idx, cls, message) {
  if (!cls.ms) return;
  const until = Date.now() + cls.ms;
  if (cls.kind === 'transient' || cls.kind === 'model') {
    const ps = providerState(name);
    ps.cooldownUntil = until; ps.reason = `${cls.kind}: ${message}`.slice(0, 200);
  } else {
    const ks = keyState(name, idx);
    ks.cooldownUntil = until; ks.reason = `${cls.kind}: ${message}`.slice(0, 200); ks.failures += 1;
  }
  logger.warn('LLM key/provider cooled down', { provider: name, key: idx, kind: cls.kind, minutes: Math.round(cls.ms / 60000) });
  saveState();
}

// ── One call ─────────────────────────────────────────────────────────────────
class LLMError extends Error {
  constructor(message, { status = 0, provider, model, retryAfterSec = 0 } = {}) {
    super(message);
    this.status = status; this.provider = provider; this.model = model; this.retryAfterSec = retryAfterSec;
  }
}

/**
 * One chat-completion call on a specific provider (and optionally a specific key index).
 * Returns { text, model, provider, usage, latencyMs }. Throws LLMError.
 */
export async function chat(systemPrompt, userContent, {
  provider, model, keyIndex = null,
  timeoutMs = DEFAULT_TIMEOUT_MS, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE,
} = {}) {
  const p = PROVIDERS[provider];
  if (!p) throw new LLMError(`Unknown LLM provider "${provider}"`, { provider });
  if (!isConfigured(provider)) throw new LLMError(`Provider "${provider}" is not configured (set ${p.keyEnv}${p.keyOptional ? ' or LLM_BASE_URL' : ''})`, { provider });

  const keys = keysFor(provider);
  const idx = keyIndex ?? pickKey(provider);
  if (idx === -1) throw new LLMError(`All keys for "${provider}" are cooling down`, { status: 429, provider, model });
  const apiKey = keys[idx];
  const useModel = model || p.defaultModel;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const res = await fetch(p.url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        ...(p.headers || {}),
      },
      body: JSON.stringify({
        model: useModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature,
        max_tokens: maxTokens,
        // gpt-oss models spend output tokens on hidden reasoning; keep it short so the answer fits.
        ...(/gpt-oss/i.test(useModel) && ['groq', 'cerebras'].includes(provider) && { reasoning_effort: process.env.LLM_REASONING_EFFORT || 'low' }),
      }),
    });

    const ks = keyState(provider, idx);
    ks.calls += 1; ks.lastUsed = Date.now();
    countCall(provider);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const raw = body?.error?.message || body?.error || body?.message || body?.detail || `HTTP ${res.status}`;
      const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);
      const retryAfterSec = parseFloat(res.headers.get('retry-after') || '0') || 0;
      const cls = classify(res.status, msg, retryAfterSec, provider);
      penalize(provider, idx, cls, msg);
      throw new LLMError(`${provider} (${useModel}) HTTP ${res.status}: ${msg}`, { status: res.status, provider, model: useModel, retryAfterSec });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new LLMError(`${provider} (${useModel}): empty completion`, { status: 502, provider, model: useModel });

    ks.failures = 0;
    saveState();
    logger.debug('LLM call ok', { provider, key: idx, model: data.model || useModel, ms: Date.now() - started, usage: data.usage });
    return { text, model: data.model || useModel, provider, keyIndex: idx, usage: data.usage || null, latencyMs: Date.now() - started };
  } catch (err) {
    if (err instanceof LLMError) throw err;
    const timedOut = err.name === 'AbortError';
    const msg = timedOut ? `timed out after ${timeoutMs}ms` : (err.message || 'network error');
    penalize(provider, idx, classify(0, msg, 0), msg);
    throw new LLMError(`${provider} (${useModel}): ${msg}`, { status: 0, provider, model: useModel });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call the model configured for `role`; on failure hop across every healthy key
 * of that provider, then every other available provider (with its default
 * model), before giving up.
 */
export async function chatResilient(systemPrompt, userContent, { role = 'DEFAULT', ...opts } = {}) {
  const primary = resolveModel(role);
  if (!primary) throw new Error('No LLM provider configured. Set at least one of the *_API_KEY variables (see .env.example).');

  const attempts = [primary];
  for (const provider of configuredProviders()) {
    if (provider !== primary.provider) attempts.push({ provider, model: PROVIDERS[provider].defaultModel });
  }

  const errors = [];
  for (const attempt of attempts) {
    const now = Date.now();
    if (providerState(attempt.provider).cooldownUntil > now || dailyExhausted(attempt.provider)) {
      errors.push(`${attempt.provider}: skipped (cooling down or daily cap)`);
      continue;
    }
    // Try each healthy key of this provider before moving on.
    const keyCount = keysFor(attempt.provider).length;
    for (let n = 0; n < keyCount; n++) {
      const idx = pickKey(attempt.provider);
      if (idx === -1) break;
      try {
        const result = await chat(systemPrompt, userContent, { ...opts, ...attempt, keyIndex: idx });
        if (opts.tally && typeof opts.tally === 'object') {
          opts.tally.calls = (opts.tally.calls || 0) + 1;
          opts.tally.prompt_tokens = (opts.tally.prompt_tokens || 0) + (result.usage?.prompt_tokens || 0);
          opts.tally.completion_tokens = (opts.tally.completion_tokens || 0) + (result.usage?.completion_tokens || 0);
        }
        return result;
      } catch (err) {
        errors.push(err.message);
        logger.warn(`LLM call failed for role ${role}`, { provider: attempt.provider, key: idx, model: attempt.model, status: err.status, error: err.message.slice(0, 160) });
        // A request-shaped error (400 from our own input) will not improve by hopping keys.
        if (err.status === 400 && !MODEL_RE.test(err.message)) break;
      }
    }
  }
  throw new Error(`All LLM providers failed for role ${role}: ${errors.join(' | ')}`);
}

/** Safe-to-expose status (no key values): which providers exist, are configured, and are cooling down. */
export function providerStatus() {
  const now = Date.now();
  const limits = dailyLimits();
  return {
    order: configuredProviders(),
    available: availableProviders(now),
    providers: Object.keys(PROVIDERS).map(name => {
      const ps = providerState(name);
      const keys = keysFor(name).map((_, i) => {
        const ks = keyState(name, i);
        return {
          index: i,
          healthy: ks.cooldownUntil <= now,
          cooldownSeconds: Math.max(0, Math.round((ks.cooldownUntil - now) / 1000)),
          reason: ks.cooldownUntil > now ? ks.reason : null,
          calls: ks.calls,
        };
      });
      return {
        name,
        configured: isConfigured(name),
        defaultModel: PROVIDERS[name].defaultModel,
        keys,
        providerCooldownSeconds: Math.max(0, Math.round((ps.cooldownUntil - now) / 1000)),
        providerCooldownReason: ps.cooldownUntil > now ? ps.reason : null,
        callsToday: ps.dayStamp === todayStamp() ? ps.dayCount : 0,
        dailyLimit: limits[name] || null,
      };
    }),
  };
}

export function describeProviders() {
  return Object.keys(PROVIDERS).map(name => ({ name, configured: isConfigured(name), defaultModel: PROVIDERS[name].defaultModel }));
}
