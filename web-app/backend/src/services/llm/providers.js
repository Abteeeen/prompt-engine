import logger from '../../utils/logger.js';

/**
 * LLM provider layer.
 *
 * Every provider here speaks the OpenAI chat-completions wire format, so one
 * `chat()` function covers Groq, OpenRouter, Hugging Face Inference Providers,
 * and any self-hosted OpenAI-compatible server (vLLM, TGI, Ollama, LM Studio).
 *
 * All keys and model choices come from environment variables. Nothing is
 * hard-coded in source. See .env.example for the full list.
 *
 * Model selection per pipeline role:
 *   LLM_MODEL_<ROLE> = "<provider>:<model>"   e.g. huggingface:Qwen/Qwen2.5-72B-Instruct
 *                    = "<provider>"           use that provider's default model
 *                    = "<model>"              model on the first configured provider
 * Roles: RESEARCHER, DRAFTER, CRITIC, OPTIMIZER, JURY, LEARNER, DEFAULT.
 *
 * Fallback order: LLM_PROVIDER_ORDER (comma list), default "groq,huggingface,openrouter,custom".
 * Only providers whose key (or base URL for `custom`) is set are ever called.
 */

const DEFAULT_TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS || '45000', 10);
const DEFAULT_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '1500', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE || '0.75');

const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    defaultModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  huggingface: {
    // Hugging Face Inference Providers router (OpenAI-compatible).
    // Override HF_BASE_URL to point at a dedicated Inference Endpoint instead.
    url: process.env.HF_BASE_URL || 'https://router.huggingface.co/v1/chat/completions',
    keyEnv: 'HF_TOKEN',
    defaultModel: process.env.HF_MODEL || 'meta-llama/Llama-3.3-70B-Instruct',
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    defaultModel: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',
    headers: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'Prompt Engine',
    },
  },
  custom: {
    // Any OpenAI-compatible server you host yourself: vLLM, TGI, Ollama, LM Studio.
    url: process.env.LLM_BASE_URL ? `${process.env.LLM_BASE_URL.replace(/\/$/, '')}/chat/completions` : null,
    keyEnv: 'LLM_API_KEY',
    keyOptional: true,
    defaultModel: process.env.LLM_MODEL || 'llama3.1',
  },
};

const ROLES = ['RESEARCHER', 'DRAFTER', 'CRITIC', 'OPTIMIZER', 'JURY', 'LEARNER', 'DEFAULT'];

export function isConfigured(name) {
  const p = PROVIDERS[name];
  if (!p || !p.url) return false;
  if (p.keyOptional) return true;
  return Boolean(process.env[p.keyEnv]);
}

/** Providers that have credentials, in fallback order. */
export function configuredProviders() {
  const order = (process.env.LLM_PROVIDER_ORDER || 'groq,huggingface,openrouter,custom')
    .split(',').map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const result = [];
  for (const name of [...order, ...Object.keys(PROVIDERS)]) {
    if (!seen.has(name) && isConfigured(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

/** Resolve "<provider>:<model>" | "<provider>" | "<model>" into { provider, model }. */
export function resolveModel(role = 'DEFAULT') {
  const key = ROLES.includes(role.toUpperCase()) ? role.toUpperCase() : 'DEFAULT';
  const spec = process.env[`LLM_MODEL_${key}`] || process.env.LLM_MODEL_DEFAULT || '';
  const available = configuredProviders();
  if (available.length === 0) return null;

  if (spec) {
    const idx = spec.indexOf(':');
    const head = idx === -1 ? spec : spec.slice(0, idx);
    const tail = idx === -1 ? '' : spec.slice(idx + 1);
    if (PROVIDERS[head]) {
      if (!isConfigured(head)) {
        logger.warn(`LLM_MODEL_${key} names provider "${head}" but it has no credentials; falling back`);
      } else {
        return { provider: head, model: tail || PROVIDERS[head].defaultModel };
      }
    } else {
      // Bare model id on the first configured provider
      return { provider: available[0], model: spec };
    }
  }
  return { provider: available[0], model: PROVIDERS[available[0]].defaultModel };
}

/** Parse ARENA_MODELS="groq:llama-3.3-70b-versatile,huggingface:Qwen/Qwen2.5-72B-Instruct". */
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
  return configuredProviders().map(provider => ({
    provider,
    model: PROVIDERS[provider].defaultModel,
    name: `${PROVIDERS[provider].defaultModel} (${provider})`,
  }));
}

/**
 * One chat-completion call. Returns { text, model, provider, usage }.
 * Throws on HTTP error, timeout, or empty completion.
 */
export async function chat(systemPrompt, userContent, { provider, model, timeoutMs = DEFAULT_TIMEOUT_MS, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = {}) {
  const p = PROVIDERS[provider];
  if (!p) throw new Error(`Unknown LLM provider "${provider}"`);
  if (!isConfigured(provider)) throw new Error(`Provider "${provider}" is not configured (set ${p.keyEnv}${p.keyOptional ? ' or LLM_BASE_URL' : ''})`);

  const apiKey = process.env[p.keyEnv];
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
        model: model || p.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.error?.message || body?.error || body?.message || `HTTP ${res.status}`;
      throw new Error(`${provider} (${model || p.defaultModel}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error(`${provider} (${model || p.defaultModel}): empty completion`);

    logger.debug('LLM call ok', { provider, model: data.model || model, ms: Date.now() - started, usage: data.usage });
    return { text, model: data.model || model || p.defaultModel, provider, usage: data.usage || null, latencyMs: Date.now() - started };
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`${provider} (${model || p.defaultModel}): timed out after ${timeoutMs}ms`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call the model configured for `role`; on failure walk every other configured
 * provider (with its default model) before giving up.
 */
export async function chatResilient(systemPrompt, userContent, { role = 'DEFAULT', ...opts } = {}) {
  const primary = resolveModel(role);
  if (!primary) throw new Error('No LLM provider configured. Set GROQ_API_KEY, HF_TOKEN, OPENROUTER_API_KEY or LLM_BASE_URL.');

  const attempts = [primary];
  for (const provider of configuredProviders()) {
    if (provider !== primary.provider) attempts.push({ provider, model: PROVIDERS[provider].defaultModel });
  }

  const errors = [];
  for (const attempt of attempts) {
    try {
      return await chat(systemPrompt, userContent, { ...opts, ...attempt });
    } catch (err) {
      errors.push(err.message);
      logger.warn(`LLM call failed for role ${role}`, { provider: attempt.provider, model: attempt.model, error: err.message });
    }
  }
  throw new Error(`All LLM providers failed for role ${role}: ${errors.join(' | ')}`);
}

export function describeProviders() {
  return Object.keys(PROVIDERS).map(name => ({
    name,
    configured: isConfigured(name),
    defaultModel: PROVIDERS[name].defaultModel,
  }));
}
