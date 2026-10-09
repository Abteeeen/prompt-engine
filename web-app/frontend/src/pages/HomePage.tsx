import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage, isQuotaError } from '../services/api'
import type { GenerationResult, RefineAnswer, Template } from '../types'
import { PromptCard } from '../components/PromptCard'
import { QualityScoreMini } from '../components/QualityScore'
import PromptHistory, { saveToHistory, type HistoryItem } from '../components/PromptHistory'
import { ResultActions } from '../components/ResultActions'
import { QuotaBadge, QuotaNotice } from '../components/Quota'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { ChevronDownIcon, PaperclipIcon, SendIcon, SparkleIcon, Spinner } from '../components/ui/Icons'

// ── Prompt types ─────────────────────────────────────────────────────────────

type PromptType = 'auto' | 'research' | 'writing' | 'planning' | 'agent' | 'image' | 'code' | 'automation'

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

const EXAMPLES = [
  'Explain quantum computing to a 10-year-old',
  'Create a social media post for our product launch',
  'Debug this Python function that processes CSV files',
  'Build a product roadmap for Q3',
]

// ── AI generator ─────────────────────────────────────────────────────────────

function AIGenerator() {
  const { user, applyUsage } = useAuth()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [lastRequest, setLastRequest] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quotaMessage, setQuotaMessage] = useState('')
  const [editedPrompt, setEditedPrompt] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [promptType, setPromptType] = useState<PromptType>('auto')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  // Clarifying-question answers → refine
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState('')

  const fileRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowTypeDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyResult = (data: GenerationResult) => {
    setResult(data)
    setEditedPrompt(data.prompt)
    setAnswers({})
    setRefineError('')
    applyUsage(data.usage)
  }

  const generate = async (text?: string) => {
    const base = (text || input).trim()
    if (base.length < 5) return

    setLoading(true)
    setError('')
    setQuotaMessage('')
    setResult(null)
    try {
      const data = await api.ai.generate(base, promptType)
      setLastRequest(base)
      applyResult(data)

      // Guests keep a local history; signed-in users get it from the server.
      if (!user) {
        saveToHistory({
          userRequest: base,
          prompt: data.prompt,
          qualityScore: data.qualityScore.overallScore,
          domain: data.domain ?? null,
          source: data.source,
        })
      }

      api.analytics.track('ai_prompt_generated', undefined, { source: data.source, promptType, hasFile: !!fileName })
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      if (isQuotaError(err)) {
        applyUsage(err.usage)
        setQuotaMessage(err.message)
      } else {
        setError(errorMessage(err, 'Failed to generate. Try again.'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOptimizeInput = async () => {
    if (input.trim().length < 5) return
    setIsOptimizing(true)
    setError('')
    setQuotaMessage('')
    try {
      const data = await api.ai.optimize(input)
      setInput(data.optimized)
      applyUsage(data.usage)
    } catch (err) {
      if (isQuotaError(err)) {
        applyUsage(err.usage)
        setQuotaMessage(err.message)
      } else {
        setError(`Optimization failed: ${errorMessage(err)}`)
      }
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleRefine = async () => {
    if (!result) return
    const questions = result.analysis?.clarifyingQuestions ?? []
    const payload: RefineAnswer[] = questions
      .map(q => ({ question: q, answer: (answers[q] || '').trim() }))
      .filter(a => a.answer.length > 0)
    if (payload.length === 0) {
      setRefineError('Answer at least one question first.')
      return
    }
    setRefining(true)
    setRefineError('')
    setQuotaMessage('')
    try {
      const data = await api.ai.refine({
        generationId: result.id,
        request: lastRequest || input.trim(),
        prompt: editedPrompt,
        answers: payload,
      })
      applyResult(data)
      api.analytics.track('ai_prompt_refined', undefined, { answered: payload.length })
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      if (isQuotaError(err)) {
        applyUsage(err.usage)
        setQuotaMessage(err.message)
      } else {
        setRefineError(errorMessage(err, 'Could not rewrite the prompt. Try again.'))
      }
    } finally {
      setRefining(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void generate()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const handleLoadFromHistory = (item: HistoryItem) => {
    setInput(item.userRequest)
    setLastRequest(item.userRequest)
    setResult({
      prompt: item.prompt,
      qualityScore: {
        overallScore: item.qualityScore,
        rating: item.qualityScore >= 26 ? 'Excellent' : item.qualityScore >= 20 ? 'Good' : item.qualityScore >= 15 ? 'Okay' : 'Needs Work',
        suggestion: '',
        breakdown: {},
        dimensions: [],
      },
      source: item.source,
      domain: item.domain,
    })
    setEditedPrompt(item.prompt)
    setAnswers({})
    setTimeout(() => {
      textareaRef.current?.focus()
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const assumptions = result?.analysis?.assumptions ?? []
  const questions = result?.analysis?.clarifyingQuestions ?? []
  const issues = result?.issues ?? []
  const answeredCount = questions.filter(q => (answers[q] || '').trim()).length

  return (
    <>
      <PromptHistory onLoad={handleLoadFromHistory} />

      <div className="w-full max-w-3xl mx-auto">
        {/* Header with quota */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">AI prompt generator</div>
          <QuotaBadge />
        </div>

        {/* Composer */}
        <div
          className="relative rounded-3xl transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            boxShadow: loading
              ? '0 0 80px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 0 60px rgba(139, 92, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what you need a prompt for..."
            rows={5}
            className="w-full bg-transparent px-6 pt-6 pb-20 text-white placeholder:text-white/30 focus:outline-none text-base leading-relaxed resize-none"
            style={{ minHeight: '140px' }}
            aria-label="Describe what you need a prompt for"
          />

          {fileName && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white/10 text-white/70 border border-white/10">
              <PaperclipIcon className="w-3 h-3" />
              <span className="max-w-[120px] truncate">{fileName}</span>
              <button onClick={() => setFileName(null)} className="ml-1 text-white/40 hover:text-white/70" aria-label="Remove file">×</button>
            </div>
          )}

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 h-14 px-4 flex items-center justify-between bg-gradient-to-t from-black/20 to-transparent">
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-white/70 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all"
                >
                  <span className="text-white/50">Type:</span>
                  <span className="text-white/90">{PROMPT_TYPE_CONFIG[promptType].label}</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTypeDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 min-w-[220px] max-h-[280px] overflow-y-auto rounded-xl z-[60]"
                    style={{ background: 'rgba(15, 15, 25, 0.98)', border: '1px solid rgba(139, 92, 246, 0.25)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}
                  >
                    {(Object.keys(PROMPT_TYPE_CONFIG) as PromptType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setPromptType(type)
                          setShowTypeDropdown(false)
                        }}
                        className={`w-full px-3 py-1.5 text-left text-[10px] transition-colors flex items-center justify-between ${
                          promptType === type ? 'bg-purple-500/15 text-white' : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <div>
                          <span className="font-medium">{PROMPT_TYPE_CONFIG[type].label}</span>
                          <p className="text-[9px] text-white/40 mt-0">{PROMPT_TYPE_CONFIG[type].hint}</p>
                        </div>
                        {promptType === type && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json,.log" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-white/50 hover:text-white/80 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all"
                title="Upload context file"
                aria-label="Upload context file"
              >
                <PaperclipIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 hidden sm:inline">{input.length > 0 ? `${input.length} chars` : 'Ctrl+Enter'}</span>

              <button
                onClick={handleOptimizeInput}
                disabled={isOptimizing || input.trim().length < 5}
                title="Rewrite your request so the generator understands it better"
                className="px-3 py-2 rounded-xl text-[10px] font-bold text-purple-400 hover:text-white hover:bg-purple-500/20 border border-purple-500/15 disabled:opacity-30 transition-all flex items-center gap-1"
              >
                {isOptimizing ? <Spinner className="w-3 h-3" /> : <SparkleIcon className="w-3 h-3" />}
                Optimize
              </button>

              <button
                onClick={() => void generate()}
                disabled={loading || input.trim().length < 5}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:scale-100"
                aria-label="Generate prompt"
              >
                {loading ? <Spinner className="w-4 h-4" /> : <SendIcon className="w-4 h-4" strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mt-5 justify-center">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex)
                void generate(ex)
              }}
              className="text-xs text-white/40 hover:text-white/70 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              {ex.length > 35 ? `${ex.slice(0, 35)}…` : ex}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 px-4 py-3 rounded-xl text-sm text-red-400 animate-fade-in text-left" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {quotaMessage && <QuotaNotice message={quotaMessage} onSignedIn={() => void generate()} />}

        {/* Loading */}
        {loading && (
          <div className="mt-8 glass rounded-2xl p-6 space-y-4 animate-fade-in text-left">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center animate-pulse-glow shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Engineering your prompt...</p>
                <p className="text-xs text-white/40">Analyzing the request, drafting, then scoring it on ten criteria</p>
              </div>
            </div>
            {[100, 85, 92, 70].map((w, i) => (
              <div key={i} className="h-3 skeleton rounded-md" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div ref={resultRef} className="mt-8 animate-slide-up text-left">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.06)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-sm font-semibold text-white">Your prompt</span>
                  <span className="text-xs text-white/40 truncate">
                    {result.source === 'template'
                      ? '· Template engine'
                      : `· AI-powered${result.refinements ? ` · ${result.refinements} refinement pass${result.refinements > 1 ? 'es' : ''}` : ''}`}
                  </span>
                </div>
                <QualityScoreMini data={result.qualityScore} />
              </div>

              {/* Actions */}
              <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <ResultActions
                  prompt={editedPrompt}
                  title={lastRequest || undefined}
                  domain={result.domain ?? null}
                  score={result.qualityScore?.overallScore}
                  generationId={result.id}
                  onCopy={() => api.analytics.track('ai_prompt_copied', undefined, { score: result.qualityScore?.overallScore })}
                />
              </div>

              {/* Editable prompt */}
              <textarea
                value={editedPrompt}
                onChange={e => setEditedPrompt(e.target.value)}
                className="w-full bg-transparent px-5 py-5 text-sm text-white/90 font-mono leading-relaxed focus:outline-none resize-none"
                style={{ minHeight: '280px' }}
                spellCheck={false}
                aria-label="Generated prompt"
              />

              {/* What would make it better */}
              {issues.length > 0 && (
                <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(245,158,11,0.04)' }}>
                  <p className="text-[11px] uppercase tracking-wide text-amber-300/80 font-semibold mb-2">What would make it better</p>
                  <ul className="space-y-1">
                    {issues.map((issue, i) => (
                      <li key={i} className="text-xs text-white/60 flex gap-2"><span className="text-amber-400">•</span><span>{issue}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assumptions + clarifying questions */}
              {(assumptions.length > 0 || questions.length > 0) && (
                <div className="px-5 py-4 grid gap-5 md:grid-cols-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(139,92,246,0.04)' }}>
                  {assumptions.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-purple-300/80 font-semibold mb-2">Assumptions made (edit the prompt if wrong)</p>
                      <ul className="space-y-1">
                        {assumptions.map((a, i) => (
                          <li key={i} className="text-xs text-white/60 flex gap-2"><span className="text-purple-400">•</span><span>{a}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {questions.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-purple-300/80 font-semibold mb-2">Answer these for an even better prompt</p>
                      <ul className="space-y-3">
                        {questions.map((q, i) => (
                          <li key={i} className="text-xs text-white/60">
                            <label className="flex gap-2 mb-1.5"><span className="text-purple-400">?</span><span>{q}</span></label>
                            <input
                              value={answers[q] || ''}
                              onChange={e => setAnswers(prev => ({ ...prev, [q]: e.target.value }))}
                              placeholder="Your answer (optional)"
                              className="input-base text-xs py-2"
                              disabled={refining}
                            />
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <button
                          onClick={handleRefine}
                          disabled={refining || answeredCount === 0}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {refining ? <Spinner className="w-3.5 h-3.5" /> : <SparkleIcon className="w-3.5 h-3.5" />}
                          {refining ? 'Rewriting…' : 'Rewrite with answers'}
                        </button>
                        {answeredCount > 0 && !refining && (
                          <span className="text-[11px] text-white/40">{answeredCount} of {questions.length} answered</span>
                        )}
                        {refineError && <span className="text-[11px] text-red-400">{refineError}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-white/40">You can edit this prompt directly above before copying.</p>
                <Link to="/generate" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                  Use a template instead
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── How it works ─────────────────────────────────────────────────────────────

const HOW_TO = [
  {
    step: '01',
    icon: <path d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-1.5 M2 22l5-1 12-12-4-4-12 12-1 5z" />,
    title: 'Describe what you need',
    desc: 'Type anything: a task, a goal, or a problem. No special format needed. Plain English is perfect.',
    example: '"Cold email to a startup CTO"',
  },
  {
    step: '02',
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
    title: 'AI engineers your prompt',
    desc: 'The engine analyzes your request, then writes a structured, detailed prompt with role, task, requirements and format.',
    example: 'Adds role, task, requirements, format...',
  },
  {
    step: '03',
    icon: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>,
    title: 'Copy & get better results',
    desc: 'Paste it into ChatGPT, Claude, Gemini or any AI tool. Get dramatically better responses every time.',
    example: 'Scored 0–30 on ten criteria',
  },
]

function HowToUse() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
      <div className="text-center mb-12">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Three steps to a better prompt</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HOW_TO.map(({ step, icon, title, desc, example }) => (
          <div key={step} className="glass p-6 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300" style={{ borderRadius: '20px' }}>
            <div className="absolute top-4 right-4 text-5xl font-black text-white/3 select-none pointer-events-none">{step}</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-purple-300" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
            </div>
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
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Domain templates</p>
          <h2 className="text-xl font-black text-white">Or start from an expert template</h2>
        </div>
        <Link to="/templates" className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0">
          Browse all {templates.length}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-hidden">
        {templates.slice(0, 5).map(t => <PromptCard key={t.id} template={t} />)}
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-hidden">
        {templates.slice(5, 10).map(t => <PromptCard key={t.id} template={t} compact />)}
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  usePageTitle(null)
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    api.templates.list().then(setTemplates).catch(() => {
      /* preview section is optional */
    })
    api.analytics.track('page_view', undefined, { page: 'home' })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-10 md:pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute pointer-events-none inset-0 overflow-hidden">
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '30%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', top: '20%', right: '20%', width: '250px', height: '250px', background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full animate-fade-in" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
            <span className="text-[12px] font-bold text-purple-200 tracking-wider">FREE AI PROMPT ENGINEER</span>
          </div>
        </div>

        <div className="relative inline-block perspective-[1000px]">
          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 animate-slide-up interactive-hover-text"
            onMouseMove={e => {
              const el = e.currentTarget
              const rect = el.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width - 0.5
              const y = (e.clientY - rect.top) / rect.height - 0.5
              el.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${y * -15}deg) scale(1.02)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)'
            }}
          >
            <span className="text-white">Any idea.</span>
            <br />
            <span className="gradient-text">Perfect prompt.</span>
          </h1>
        </div>

        <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Type what you need. Get a complete, scored prompt you can paste into ChatGPT or Claude.
        </p>

        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <AIGenerator />
        </div>
      </section>

      <HowToUse />
      <TemplatesPreview templates={templates} />
    </div>
  )
}
