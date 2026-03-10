import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Template, QualityScore } from '../types'
import { TemplateCard } from '../components/TemplateCard'
import { QualityScoreMini } from '../components/QualityScore'

// ── AI Prompt Generator ─────────────────────────────────────────────────────

type PromptType =
  | 'auto'
  | 'research'
  | 'writing'
  | 'planning'
  | 'agent'
  | 'image'
  | 'code'
  | 'automation'

const PROMPT_TYPE_CONFIG: Record<PromptType, { label: string; hint: string }> = {
  auto: { label: 'Auto', hint: 'Let the AI detect the best structure automatically.' },
  research: { label: 'Research', hint: 'Analyze, investigate, or summarize information and data.' },
  writing: { label: 'Writing', hint: 'Blogs, emails, articles, landing pages, and more.' },
  planning: { label: 'Planning', hint: 'Explore options, strategize, and plan projects or goals.' },
  agent: { label: 'Agent', hint: 'Design custom GPTs, personas, or reusable assistants.' },
  image: { label: 'Image', hint: 'Describe images, styles, and constraints for image models.' },
  code: { label: 'Code', hint: 'Development, debugging, refactors, and code reviews.' },
  automation: { label: 'Automation', hint: 'Workflows for tools like n8n, Zapier, and similar.' },
}

interface AIResult {
  prompt: string
  qualityScore: QualityScore
  source: string
}

function CopyBtn({ text, large }: { text: string; large?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-2 font-semibold transition-all active:scale-95 ${large
        ? 'h-10 px-5 rounded-xl text-sm bg-white/8 hover:bg-white/12 text-white border border-white/10'
        : 'h-8 px-3 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/8'}`}
    >
      {copied
        ? <><svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg><span className={large ? 'text-emerald-400' : ''}>Copied!</span></>
        : <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
      }
    </button>
  )
}

const EXAMPLES = [
  'Explain quantum computing to a 10-year-old',
  'Analyze customer churn data and find patterns',
  'Create a social media post for our product launch',
  'Debug this Python function that processes CSV files',
  'Help me analyse a dataset',
  'Build a product roadmap for Q3',
]

function AIGenerator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<AIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editedPrompt, setEditedPrompt] = useState('')
  const [promptType, setPromptType] = useState<PromptType>('auto')
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const generate = async (text?: string) => {
    const base = (text || input).trim()
    if (base.length < 5) return

    const typeMeta = PROMPT_TYPE_CONFIG[promptType]
    const typePrefix =
      promptType === 'auto'
        ? ''
        : `\n\nPROMPT TYPE: ${typeMeta.label}\nINTENT: ${typeMeta.hint}\n`

    const req = `${base}${typePrefix}`
    if (req.length < 5) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await api.ai.generate(req)
      setResult(data)
      setEditedPrompt(data.prompt)
      api.analytics.track('ai_prompt_generated', undefined, {
        source: data.source,
        promptType,
        hasFile: !!fileName,
      })
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
        {/* Sidebar: prompt type + file */}
        <aside className="glass rounded-2xl p-4 space-y-4 md:sticky md:top-28">
          <div>
            <p className="text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-2">Prompt type</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(PROMPT_TYPE_CONFIG) as PromptType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPromptType(type)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${promptType === type
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                  {PROMPT_TYPE_CONFIG[type].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              {PROMPT_TYPE_CONFIG[promptType].hint}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-2">Context file (optional)</p>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.json,.log"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) {
                  setFileName(null)
                  return
                }
                setFileName(file.name)
                try {
                  const text = await file.text()
                  const snippet = text.slice(0, 4000)
                  setInput(prev => prev || `Use this file as context:\n\n${snippet}`)
                  textareaRef.current?.focus()
                } catch {
                  setError('Could not read file contents. Try a smaller or plain-text file.')
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-9 px-3 rounded-lg text-xs flex items-center justify-between bg-white/5 text-gray-200 hover:bg-white/10 border border-dashed border-white/20 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><path d="M7 9l5-5 5 5" /><path d="M12 4v12" /></svg>
                {fileName ? <span className="truncate max-w-[120px]">{fileName}</span> : 'Upload context file'}
              </span>
              <span className="text-[10px] text-gray-500">.txt · .md · .csv · .json</span>
            </button>
          </div>

          <div className="hidden md:block text-[10px] text-gray-600">
            Tip: Start with your goal in plain English. We engineer the rest.
          </div>
        </aside>

        {/* Input area */}
        <div>
          <div
            className="glass rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: loading ? '0 0 60px rgba(139,92,246,0.2)' : '0 0 40px rgba(139,92,246,0.1)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe what you need a prompt for... e.g. 'summarize this meeting in 3 bullet points'"
              rows={4}
              className="w-full bg-transparent px-5 pt-5 pb-3 text-white placeholder-gray-600 focus:outline-none text-sm leading-relaxed resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 pb-4 pt-1">
              <span className="text-xs text-gray-600">
                {input.length > 0 ? `${input.length} chars` : 'Ctrl+Enter to generate'}
              </span>
              <button
                onClick={() => generate()}
                disabled={loading || input.trim().length < 5}
                className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/25 hover:shadow-purple-500/45 hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none w-full sm:w-auto"
              >
                {loading
                  ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>Engineering...</>
                  : <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>Generate Prompt</>
                }
              </button>
            </div>
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            {EXAMPLES.slice(0, 4).map(ex => (
              <button
                key={ex}
                onClick={() => { setInput(ex); generate(ex) }}
                className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-white/5 hover:border-white/10"
              >
                {ex.length > 40 ? ex.slice(0, 40) + '…' : ex}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400 animate-fade-in" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Loading shimmer */}
          {loading && (
            <div className="mt-6 glass rounded-2xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center animate-pulse-glow shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Senior prompt engineer at work...</p>
                  <p className="text-xs text-gray-500">Crafting the perfect prompt for your request</p>
                </div>
              </div>
              {[100, 85, 92, 70].map((w, i) => (
                <div key={i} className="h-3 skeleton rounded-md" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div ref={resultRef} className="mt-6 animate-slide-up">
              <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
                {/* Result header */}
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white">Your Perfect Prompt</span>
                    <span className="text-xs text-gray-600">
                      {result.source === 'groq' ? '· AI-powered' : '· Template engine'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QualityScoreMini data={result.qualityScore} />
                    <CopyBtn text={editedPrompt} large />
                  </div>
                </div>

                {/* Editable prompt */}
                <textarea
                  value={editedPrompt}
                  onChange={e => setEditedPrompt(e.target.value)}
                  className="w-full bg-transparent px-5 py-4 text-sm text-gray-200 font-mono leading-relaxed focus:outline-none resize-none"
                  style={{ minHeight: '240px' }}
                  spellCheck={false}
                />

                {/* Footer hint */}
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-600">You can edit this prompt directly above before copying.</p>
                  <Link
                    to="/generate"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    Use a template instead
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── How to use ───────────────────────────────────────────────────────────────

const HOW_TO = [
  {
    step: '01',
    icon: '✍️',
    title: 'Describe what you need',
    desc: 'Type anything a task, a goal, or a problem. No special format needed. Plain English is perfect.',
    example: '"Cold email to a startup CTO"',
  },
  {
    step: '02',
    icon: '⚡',
    title: 'AI engineers your prompt',
    desc: 'Our senior prompt engineer AI transforms your request into a structured, detailed, production-ready prompt.',
    example: 'Adds role, task, requirements, format...',
  },
  {
    step: '03',
    icon: '🚀',
    title: 'Copy & get better results',
    desc: 'Paste it into ChatGPT, Claude, Gemini any AI tool. Get dramatically better responses every time.',
    example: 'Quality score: 28–30 / 30',
  },
]

function HowToUse() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Three steps to a perfect prompt</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HOW_TO.map(({ step, icon, title, desc, example }) => (
          <div key={step} className="glass p-6 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300" style={{ borderRadius: '20px' }}>
            {/* Step number watermark */}
            <div className="absolute top-4 right-4 text-5xl font-black text-white/3 select-none pointer-events-none">{step}</div>

            <div className="text-2xl mb-4">{icon}</div>
            <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{desc}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              {example}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Templates preview ────────────────────────────────────────────────────────

function TemplatesPreview({ templates }: { templates: Template[] }) {
  if (!templates.length) return null
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Domain templates</p>
          <h2 className="text-xl font-black text-white">Or start from an expert template</h2>
        </div>
        <Link to="/templates" className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0">
          Browse all 10
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {templates.slice(0, 5).map(t => <TemplateCard key={t.id} template={t} />)}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {templates.slice(5, 10).map(t => <TemplateCard key={t.id} template={t} compact />)}
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    api.templates.list().then(setTemplates).catch(() => { })
    api.analytics.track('page_view', undefined, { page: 'home' })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-16 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-fade-in" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-300 tracking-wide">⚡ Your personal AI prompt engineer — free</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-5 animate-slide-up">
          <span className="text-white">Any idea.</span>
          <br />
          <span className="gradient-text">Perfect prompt.</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-12 animate-slide-up text-balance" style={{ animationDelay: '0.1s' }}>
          Describe what you need in plain English. Our AI acts as a senior prompt engineer and crafts the ultimate prompt for you instantly.
        </p>

        {/* Generator */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <AIGenerator />
        </div>
      </section>

      {/* How to use */}
      <HowToUse />

      {/* Templates */}
      <TemplatesPreview templates={templates} />
    </div>
  )
}
