import type { Template, FormStructure, GenerateResult, SearchResult, FormData } from '../types'

const BASE = ((import.meta as any).env?.VITE_API_URL || '') + '/api'

async function readJsonSafe(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return res.json().catch(() => null)
  }
  const text = await res.text().catch(() => '')
  return text ? { error: text } : null
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const sessionId = getSessionId()
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    'X-Session-Id': sessionId, 
    ...options?.headers as Record<string, string> 
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  })
  
  if (!res.ok) {
    const err = await readJsonSafe(res)
    const msg =
      (err && typeof err === 'object' && 'error' in err && typeof (err as any).error === 'string' && (err as any).error) ||
      res.statusText ||
      `Request failed (${res.status})`
      
    // Custom error to allow catching 429 easily
    const errorObj = new Error(msg) as any;
    errorObj.status = res.status;
    throw errorObj;
  }

  const data = await readJsonSafe(res)
  return data as T
}

export const api = {
  auth: {
    google: async (credential: string) => {
      const res = await request<{token: string, user: any}>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      })
      localStorage.setItem('token', res.token)
      return res.user
    },
    profile: () => request<any>('/users/profile'),
    logout: () => {
      localStorage.removeItem('token')
    }
  },
  templates: {
    list: () => request<Template[]>('/templates'),
    get:  (id: string) => request<Template>(`/templates/${encodeURIComponent(id)}`),
    search: (q: string) => request<SearchResult[]>(`/templates/search?q=${encodeURIComponent(q)}`),
  },
  forms: {
    get: (templateId: string, mode: 'quick' | 'standard' | 'advanced' = 'standard') =>
      request<FormStructure>(`/forms/${encodeURIComponent(templateId)}?mode=${mode}`),
  },
  prompts: {
    getQuota: () => request<{ allowed: boolean; remaining: number | string; totalUsed: number; limit: number }>('/prompts/quota'),
    generate: (templateId: string, formData: FormData, options?: Record<string, string>) =>
      request<GenerateResult>('/prompts/generate', {
        method: 'POST',
        body: JSON.stringify({ templateId, formData, options }),
      }),
  },
  ai: {
    generate: (userRequest: string) =>
      request<{ prompt: string; qualityScore: import('../types').QualityScore; model: string; source: string }>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ request: userRequest }),
      }),
  },
  analytics: {
    track: (event: string, templateId?: string, metadata?: Record<string, unknown>) => {
      const sessionId = getSessionId()
      fetch(`${BASE}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, templateId, sessionId, metadata }),
      }).catch(() => {/* silent */})
    },
  },
}

function getSessionId(): string {
  let id = sessionStorage.getItem('sid')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('sid', id)
  }
  return id
}
