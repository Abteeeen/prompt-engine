import type { Template, FormStructure, GenerateResult, SearchResult, FormData } from '../types'

const BASE = ((import.meta as any).env?.VITE_API_URL || '') + '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
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
