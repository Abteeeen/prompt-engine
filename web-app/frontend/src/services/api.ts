import type { Template, FormStructure, GenerateResult, SearchResult, FormData, AuthResponse, MeResponse, Usage, GenerationResult, OptimizeResult, RefinePayload, GenerationRecord, LibraryPromptSummary, LibraryPrompt, CreatePromptInput, UpdatePromptInput, PromptRating, Profile, ProfileInput, FeedbackInput, ApiErrorBody, GenerationSignal, User } from '../types'

export const API_URL = import.meta.env.VITE_API_URL || ''
const BASE = `${API_URL}/api`

export const TOKEN_KEY = 'token'

// ── Errors ───────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  code?: string
  usage?: Usage

  constructor(message: string, status: number, code?: string, usage?: Usage) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.usage = usage
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

export function isQuotaError(err: unknown): err is ApiError {
  return isApiError(err) && err.status === 429 && err.code === 'QUOTA_EXCEEDED'
}

export function isUnauthorized(err: unknown): err is ApiError {
  return isApiError(err) && err.status === 401
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

// ── Low-level request ────────────────────────────────────────────────────────

async function readJsonSafe(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return res.json().catch(() => null)
  }
  const text = await res.text().catch(() => '')
  return text ? { error: text } : null
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'error' in value && typeof (value as ApiErrorBody).error === 'string'
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method: options.method || 'GET',
      headers: buildHeaders(),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, 'NETWORK')
  }

  if (!res.ok) {
    const body = await readJsonSafe(res)
    const message = isErrorBody(body) ? body.error : res.statusText || `Request failed (${res.status})`
    const code = isErrorBody(body) ? body.code : undefined
    const usage = isErrorBody(body) ? body.usage : undefined
    throw new ApiError(message, res.status, code, usage)
  }

  const data = await readJsonSafe(res)
  return data as T
}

// ── Token & session helpers ──────────────────────────────────────────────────

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable; ignore
  }
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem('sid')
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('sid', id)
    }
    return id
  } catch {
    return 'anon'
  }
}

// ── API surface ──────────────────────────────────────────────────────────────

export const api = {
  auth: {
    google: (credential: string) =>
      request<AuthResponse>('/auth/google', { method: 'POST', body: { credential } }),
    me: () => request<MeResponse>('/auth/me'),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    deleteAccount: () => request<{ success: boolean }>('/auth/account', { method: 'DELETE' }),
    setPreferences: (prefs: { share_examples: boolean }) =>
      request<{ user: User }>('/auth/preferences', { method: 'PUT', body: prefs }),
  },

  usage: {
    get: () => request<Usage>('/usage'),
  },

  templates: {
    list: () => request<Template[]>('/templates'),
    get: (id: string) => request<Template>(`/templates/${encodeURIComponent(id)}`),
    search: (q: string) => request<SearchResult[]>(`/templates/search?q=${encodeURIComponent(q)}`),
    /** Template fill: POST /api/prompts/generate */
    fill: (templateId: string, formData: FormData, options?: Record<string, string>) =>
      request<GenerateResult>('/prompts/generate', {
        method: 'POST',
        body: { templateId, formData, options },
      }),
  },

  forms: {
    get: (templateId: string, mode: 'quick' | 'standard' | 'advanced' = 'standard') =>
      request<FormStructure>(`/forms/${encodeURIComponent(templateId)}?mode=${mode}`),
  },

  ai: {
    generate: (userRequest: string, promptType?: string) =>
      request<GenerationResult>('/ai/generate', {
        method: 'POST',
        body: promptType && promptType !== 'auto' ? { request: userRequest, promptType } : { request: userRequest },
      }),
    optimize: (userRequest: string) =>
      request<OptimizeResult>('/ai/optimize', { method: 'POST', body: { request: userRequest } }),
    refine: (payload: RefinePayload) =>
      request<GenerationResult>('/ai/refine', { method: 'POST', body: payload }),
  },

  generations: {
    list: (limit = 50) => request<GenerationRecord[]>(`/generations?limit=${limit}`),
    /** Fire-and-forget feedback that teaches the knowledge base. Never throws. */
    signal: (id: string, signal: GenerationSignal) => {
      request<{ success: boolean }>(`/generations/${encodeURIComponent(id)}/signal`, { method: 'POST', body: { signal } }).catch(() => {})
    },
  },

  library: {
    list: () => request<LibraryPromptSummary[]>('/prompts'),
    create: (input: CreatePromptInput) => request<LibraryPrompt>('/prompts', { method: 'POST', body: input }),
    get: (id: string) => request<LibraryPrompt>(`/prompts/${encodeURIComponent(id)}`),
    update: (id: string, input: UpdatePromptInput) =>
      request<LibraryPrompt>(`/prompts/${encodeURIComponent(id)}`, { method: 'PUT', body: input }),
    remove: (id: string) => request<{ success: boolean }>(`/prompts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    rate: (id: string, rating: PromptRating, reason?: string) =>
      request<{ success: boolean }>(`/prompts/${encodeURIComponent(id)}/rate`, {
        method: 'POST',
        body: reason ? { rating, reason } : { rating },
      }),
    favorite: (id: string) =>
      request<{ is_favorite: boolean }>(`/prompts/${encodeURIComponent(id)}/favorite`, { method: 'POST' }),
  },

  profile: {
    get: () => request<Profile | null>('/profile'),
    update: (input: ProfileInput) => request<Profile>('/profile', { method: 'PUT', body: input }),
  },

  feedback: {
    send: (input: FeedbackInput) => request<{ success: boolean }>('/feedback', { method: 'POST', body: input }),
  },

  analytics: {
    track: (event: string, templateId?: string, metadata?: Record<string, unknown>) => {
      request<{ success: boolean }>('/analytics/event', {
        method: 'POST',
        body: { event, templateId, sessionId: getSessionId(), metadata },
      }).catch(() => {
        /* analytics must never break the UI */
      })
    },
  },
}
