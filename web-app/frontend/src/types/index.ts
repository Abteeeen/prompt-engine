// ── Templates & forms ────────────────────────────────────────────────────────

export interface Template {
  id: string
  name: string
  description: string
  category: string
  domain: string
  qualityScore: number
  brackets?: string[]
  mainTemplate?: string
  quickTemplate?: string
  examples?: string[]
  variations?: string[]
  proTips?: string[]
  qualityChecklist?: string[]
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox'
  placeholder?: string
  help?: string
  required?: boolean
  options?: string[]
}

export interface FormStructure {
  templateId: string
  mode: 'quick' | 'standard' | 'advanced'
  fields: FormField[]
  proTips: string[]
}

export interface PromptVariation {
  label: string
  text: string
}

export interface QualityDimension {
  key: string
  label: string
  description: string
  score: number
  maxScore: number
}

export interface QualityScore {
  overallScore: number
  breakdown: Record<string, number>
  rating: 'Excellent' | 'Good' | 'Okay' | 'Needs Work'
  suggestion: string
  dimensions: QualityDimension[]
  method?: string
}

/** Result of POST /api/prompts/generate (template fill). */
export interface GenerateResult {
  templateId: string
  templateName: string
  formData: Record<string, string>
  variations: PromptVariation[]
  prompt: string
  qualityScore: QualityScore
  usage?: Usage
}

export interface SearchResult {
  id: string
  name: string
  description: string
  category: string
  relevanceScore: number
}

export type FormData = Record<string, string>

// ── Auth & usage ─────────────────────────────────────────────────────────────

export type Plan = 'guest' | 'free' | 'pro'

export interface Usage {
  plan: Plan
  used: number
  /** null means unlimited */
  limit: number | null
  /** null means unlimited */
  remaining: number | null
  resetsAt: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  plan: 'free' | 'pro'
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface MeResponse {
  user: User
  usage: Usage
}

// ── AI generation ────────────────────────────────────────────────────────────

export interface GenerationAnalysis {
  assumptions?: string[]
  clarifyingQuestions?: string[]
  audience?: string
  goal?: string
  deliverable?: string
  framework?: string
  complexity?: string
  method?: string
}

/** Result of POST /api/ai/generate and POST /api/ai/refine. */
export interface GenerationResult {
  id?: string
  prompt: string
  model?: string
  source: string
  pipeline?: string[]
  domain?: string | null
  detectedType?: string | null
  analysis?: GenerationAnalysis | null
  qualityScore: QualityScore
  issues?: string[]
  refinements?: number
  latencyMs?: number
  usage?: Usage
}

export interface OptimizeResult {
  optimized: string
  original: string
  qualityScore?: QualityScore
  issues?: string[]
  refinements?: number
  model?: string
  provider?: string
  usage?: Usage
}

export interface RefineAnswer {
  question: string
  answer: string
}

export interface RefinePayload {
  generationId?: string
  request: string
  prompt: string
  answers: RefineAnswer[]
}

/** Row of GET /api/generations. */
export interface GenerationRecord {
  id: string
  request: string
  prompt: string
  quality_score: number | null
  domain: string | null
  created_at: string
}

// ── Library ──────────────────────────────────────────────────────────────────

export type PromptRating = -1 | 0 | 1

export interface LibraryPromptSummary {
  id: string
  title: string
  domain: string | null
  score: number | null
  tags: string[]
  is_favorite: boolean
  rating: PromptRating | null
  version_count: number
  updated_at: string
  created_at: string
}

export interface PromptVersion {
  id: string
  version_no: number
  body: string
  score: number | null
  created_at: string
}

export interface LibraryPrompt {
  id: string
  title: string
  domain: string | null
  tags: string[]
  is_favorite: boolean
  rating: PromptRating | null
  score: number | null
  body: string
  versions: PromptVersion[]
  created_at: string
  updated_at: string
}

export interface CreatePromptInput {
  title: string
  body: string
  domain?: string | null
  tags?: string[]
  score?: number | null
  generationId?: string
}

export interface UpdatePromptInput {
  title?: string
  body?: string
  tags?: string[]
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileInput {
  brand_voice: string
  product_facts: string
  audience: string
  constraints: string
}

export interface Profile extends ProfileInput {
  updated_at: string
}

// ── Misc ─────────────────────────────────────────────────────────────────────

export interface FeedbackInput {
  message: string
  email?: string
  page?: string
  rating?: number
}

export interface ApiErrorBody {
  error: string
  code?: string
  usage?: Usage
}
