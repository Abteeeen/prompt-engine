import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import type { Template, QualityScore, GenerateResult } from '../types'
import { Link } from 'react-router-dom'
import { discoverPrompts, type DiscoverPrompt } from '../data/discoverPrompts'
import { DiscoverPage } from '../pages/DiscoverPage'
import { DiscoverDetailPage } from '../pages/DiscoverDetailPage'
import { PromptCard } from '../components/PromptCard'
import PromptHistory, { HistoryItem, saveToHistory } from '../components/PromptHistory'
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

// ── Icons ───────────────────────────────────────────────────────────────────

function SendIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function PaperclipIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CopyIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

// ── Components ───────────────────────────────────────────────────────────────

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
        ? <><CheckIcon className="w-3.5 h-3.5 text-emerald-400" /><span className={large ? 'text-emerald-400' : ''}>Copied!</span></>
        : <><CopyIcon className="w-3.5 h-3.5" /><span>Copy</span></>
      }
    </button>
  )
}

const EXAMPLES = [
  'Explain quantum computing to a 10-year-old',
  'Create a social media post for our product launch',
  'Debug this Python function that processes CSV files',
  'Build a product roadmap for Q3',
]

function AIGenerator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<AIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editedPrompt, setEditedPrompt] = useState('')
  const [promptType, setPromptType] = useState<PromptType>('auto')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showOptionsPanel, setShowOptionsPanel] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null)

  // ─── Persona Mode ───────────────────────────────────────────────
  type Persona = 'auto' | 'ceo' | 'developer' | 'academic' | 'creative'
  const PERSONAS: { id: Persona; label: string; emoji: string; hint: string }[] = [
    { id: 'auto',      label: 'Auto',     emoji: '✨', hint: 'Smart default' },
    { id: 'ceo',       label: 'CEO',      emoji: '💼', hint: 'Executive, strategic, ROI-focused' },
    { id: 'developer', label: 'Dev',      emoji: '💻', hint: 'Technical, precise, code-first' },
    { id: 'academic',  label: 'Academic', emoji: '📚', hint: 'Rigorous, citations, formal' },
    { id: 'creative',  label: 'Creative', emoji: '🎨', hint: 'Imaginative, bold, story-driven' },
  ]
  const [persona, setPersona] = useState<Persona>('auto')

  // ─── Output Length ──────────────────────────────────────────────
  type PromptLength = 'focused' | 'standard' | 'detailed'
  const LENGTHS: { id: PromptLength; label: string; words: string }[] = [
    { id: 'focused',  label: '⚡ Focused',  words: '~100 words' },
    { id: 'standard', label: '📝 Standard', words: '~300 words' },
    { id: 'detailed', label: '🔍 Detailed', words: '~600 words' },
  ]
  const [promptLength, setPromptLength] = useState<PromptLength>('standard')

  const optionsPanelRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close both dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false)
      }
      if (optionsPanelRef.current && !optionsPanelRef.current.contains(e.target as Node)) {
        setShowOptionsPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const generate = async (text?: string) => {
    const base = (text || input).trim()
    if (base.length < 5) return

    const typeMeta = PROMPT_TYPE_CONFIG[promptType]
    const typePrefix =
      promptType === 'auto'
        ? ''
        : `\n\nPROMPT TYPE: ${typeMeta.label}\nINTENT: ${typeMeta.hint}\n`

    // Inject persona context
    const personaMap: Record<string, string> = {
      ceo:       '\n\nPERSONA MODE: CEO / Executive. Write this prompt for a business leader. Focus on ROI, strategy, outcomes, and high-level decisions. Use executive language. Avoid jargon.',
      developer: '\n\nPERSONA MODE: Developer / Engineer. Write this prompt for a senior software engineer. Be technically precise. Include code examples where relevant. Use proper terminology.',
      academic:  '\n\nPERSONA MODE: Academic / Researcher. Write this prompt for a researcher or student. Be rigorous and methodological. Include citation guidance and formal structure.',
      creative:  '\n\nPERSONA MODE: Creative Director. Write this prompt for a creative thinker. Be imaginative, bold, and story-driven. Encourage lateral thinking and vivid imagery.',
    }
    const personaPrefix = personaMap[persona] || ''

    // Inject length instruction
    const lengthMap: Record<string, string> = {
      focused:  '\n\nOUTPUT LENGTH: Write a FOCUSED prompt of approximately 80-120 words. Be direct and sharp. No padding.',
      standard: '\n\nOUTPUT LENGTH: Write a STANDARD prompt of approximately 250-350 words. Well-structured and complete.',
      detailed: '\n\nOUTPUT LENGTH: Write a DETAILED prompt of approximately 500-700 words. Exhaustive, with full role, task, requirements, constraints, edge cases, examples, and self-review.',
    }
    const lengthPrefix = lengthMap[promptLength] || ''

    const req = `${base}${typePrefix}${personaPrefix}${lengthPrefix}`
    if (req.length < 5) return
    setLoading(true)
    setError('')
    setResult(null)
    setFeedbackGiven(null)
    try {
      const data = await api.ai.generate(req)
      setResult(data)
      setEditedPrompt(data.prompt)

      // Save to history
      saveToHistory({
        userRequest: base,
        prompt: data.prompt,
        qualityScore: data.qualityScore.overallScore,
        domain: null,
        source: data.source,
      })

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
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      generate()
    }
  }

  const handleFeedback = async (rating: 'up' | 'down') => {
    if (!result || feedbackGiven) return
    setFeedbackGiven(rating)
    if (rating === 'up') {
      try {
        await fetch('http://localhost:3000/api/ai/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request: input, prompt: result.prompt, rating })
        })
      } catch (err) {
        console.error('Feedback failed', err)
      }
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
    })
    setEditedPrompt(item.prompt)
    setTimeout(() => {
      textareaRef.current?.focus()
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <>
      <PromptHistory onLoad={handleLoadFromHistory} />

      {/* Full-page backdrop — blurs and dims page when any panel is open */}
      {(showTypeDropdown || showOptionsPanel) && (
        <div
          onClick={() => { setShowTypeDropdown(false); setShowOptionsPanel(false) }}
          className="fixed inset-0 z-[9998]"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        />
      )}

      <div className="w-full max-w-3xl mx-auto">
        {/* Main Input Container */}
        <div
          className="relative rounded-3xl backdrop-blur-3xl"
          style={{
            background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))',
            border: `1px solid var(--glass-border, rgba(139, 92, 246, 0.25))`,
            boxShadow: loading
              ? '0 0 80px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)'
              : '0 4px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            position: 'relative',
            zIndex: (showTypeDropdown || showOptionsPanel) ? 9999 : 1,
          }}
        >
          {/* Subtle glowing edge effect inside the box */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }} />
          {/* Inner dim overlay: hides textarea text when a panel is open so it doesn't bleed through */}
          {(showTypeDropdown || showOptionsPanel) && (
            <div
              className="absolute inset-0 rounded-3xl z-10"
              style={{ background: 'rgba(10, 10, 20, 0.88)' }}
            />
          )}
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what you need a prompt for..."
            rows={5}
            className="w-full bg-transparent px-6 pt-6 pb-20 focus:outline-none text-base leading-relaxed resize-none rounded-3xl"
            style={{ minHeight: '150px', color: 'var(--text)', caretColor: 'var(--accent)' }}
          />

          {/* File attachment indicator */}
          {fileName && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white/10 text-white/70 border border-white/10">
              <PaperclipIcon className="w-3 h-3" />
              <span className="max-w-[120px] truncate">{fileName}</span>
              <button
                onClick={() => setFileName(null)}
                className="ml-1 text-white/40 hover:text-white/70"
              >
                ×
              </button>
            </div>
          )}

          {/* Bottom Bar - single clean row */}
          <div className="absolute bottom-0 left-0 right-0 h-14 px-3 flex items-center justify-between z-20"
            style={{ background: 'linear-gradient(to top, var(--bg, rgba(0,0,0,0.4)) 0%, transparent 100%)' }}
          >
            {/* Left: Type dropdown + file + OPTIONS BUTTON */}
            <div className="flex items-center gap-2">

              {/* Prompt Type Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    color: 'var(--muted)',
                    background: 'var(--glass-bg, rgba(255,255,255,0.06))',
                    border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                  }}
                >
                  <span style={{ opacity: 0.6 }}>Type:</span>
                  <span style={{ color: 'var(--text)' }}>{PROMPT_TYPE_CONFIG[promptType].label}</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTypeDropdown && (
                  <div
                    className="absolute bottom-full left-0 mb-2 min-w-[220px] max-h-[280px] overflow-y-auto rounded-xl z-[9999]"
                    style={{
                      background: 'var(--glass-bg, rgba(15,15,25,0.98))',
                      border: '1px solid var(--glass-border, rgba(139,92,246,0.25))',
                      boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {(Object.keys(PROMPT_TYPE_CONFIG) as PromptType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setPromptType(type); setShowTypeDropdown(false) }}
                        className="w-full px-3 py-1.5 text-left text-[10px] transition-colors flex items-center justify-between"
                        style={{ color: promptType === type ? 'var(--accent)' : 'var(--muted)' }}
                      >
                        <div>
                          <span className="font-medium" style={{ color: 'var(--text)' }}>{PROMPT_TYPE_CONFIG[type].label}</span>
                          <p className="text-[9px] opacity-50 mt-0">{PROMPT_TYPE_CONFIG[type].hint}</p>
                        </div>
                        {promptType === type && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json,.log" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                title="Upload context file"
                style={{
                  color: 'var(--muted)',
                  background: 'var(--glass-bg, rgba(255,255,255,0.06))',
                  border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                }}
              >
                <PaperclipIcon className="w-4 h-4" />
              </button>

              {/* ⚙ Options Toggle — compact badge shows active non-default selections */}
              <div className="relative" ref={optionsPanelRef}>
                <button
                  onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    color: (persona !== 'auto' || promptLength !== 'standard') ? 'var(--accent)' : 'var(--muted)',
                    background: showOptionsPanel ? 'rgba(139,92,246,0.15)' : 'var(--glass-bg, rgba(255,255,255,0.06))',
                    border: showOptionsPanel
                      ? '1px solid rgba(139,92,246,0.5)'
                      : '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                  }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
                  </svg>
                  <span>Options</span>
                  {(persona !== 'auto' || promptLength !== 'standard') && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  )}
                </button>

                {/* Floating options panel — slides up above the bar */}
                {showOptionsPanel && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mb-3 w-[calc(100vw-2rem)] sm:w-72 max-w-[320px] rounded-2xl p-4 z-[9999]"
                    style={{
                      background: 'var(--glass-bg, rgba(15,15,25,0.97))',
                      border: '1px solid var(--glass-border, rgba(139,92,246,0.2))',
                      boxShadow: '0 -8px 40px rgba(0,0,0,0.35)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    {/* Persona Section */}
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Persona Mode</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {PERSONAS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setPersona(p.id)}
                          title={p.hint}
                          className="flex items-center gap-1 h-7 px-2.5 rounded-xl text-[11px] font-medium transition-all"
                          style={{
                            color: persona === p.id ? 'var(--accent)' : 'var(--muted)',
                            background: persona === p.id ? 'rgba(139,92,246,0.18)' : 'var(--glass-bg)',
                            border: persona === p.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid var(--glass-border)',
                            fontWeight: persona === p.id ? 600 : 400,
                          }}
                        >
                          <span>{p.emoji}</span>
                          <span style={{ color: 'var(--text)' }}>{p.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Divider */}
                    <hr style={{ borderColor: 'var(--glass-border)', marginBottom: '12px' }} />

                    {/* Length Section */}
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Output Length</p>
                    <div className="flex gap-1.5">
                      {LENGTHS.map(l => (
                        <button
                          key={l.id}
                          onClick={() => setPromptLength(l.id)}
                          title={l.words}
                          className="flex-1 py-2 rounded-xl text-[11px] font-medium text-center transition-all"
                          style={{
                            color: promptLength === l.id ? 'var(--accent)' : 'var(--muted)',
                            background: promptLength === l.id ? 'rgba(6,182,212,0.15)' : 'var(--glass-bg)',
                            border: promptLength === l.id ? '1px solid rgba(6,182,212,0.4)' : '1px solid var(--glass-border)',
                            fontWeight: promptLength === l.id ? 600 : 400,
                          }}
                        >
                          <div style={{ color: 'var(--text)' }}>{l.label}</div>
                          <div className="text-[9px] opacity-50 mt-0.5">{l.words}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: char count + Send */}
            <div className="flex items-center gap-3">
              <span className="text-xs hidden sm:inline" style={{ color: 'var(--muted)', opacity: 0.6 }}>
                {input.length > 0 ? `${input.length} chars` : 'Ctrl+Enter'}
              </span>
              <button
                onClick={() => generate()}
                disabled={loading || input.trim().length < 5}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:scale-100"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>{/* End Bottom Bar */}
        </div>{/* End Main Input Container */}

        {/* Example Chips - Centered Below */}
        <div className="flex flex-wrap gap-2 mt-5 justify-center">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => { setInput(ex); generate(ex) }}
              className="text-xs text-white/40 hover:text-white/70 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              {ex.length > 35 ? ex.slice(0, 35) + '…' : ex}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 px-4 py-3 rounded-xl text-sm text-red-400 animate-fade-in" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div className="mt-8 glass rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center animate-pulse-glow shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Senior prompt engineer at work...</p>
                <p className="text-xs text-white/40">Crafting the perfect prompt for your request</p>
              </div>
            </div>
            {[100, 85, 92, 70].map((w, i) => (
              <div key={i} className="h-3 skeleton rounded-md" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {/* Result - Full Width */}
        {result && !loading && (
          <div ref={resultRef} className="mt-8 animate-slide-up">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              {/* Result header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Your Perfect Prompt</span>
                  <span className="text-xs text-white/40">
                    {result.source === 'groq' ? '· AI-powered' : '· Prompt engine'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <QualityScoreMini data={result.qualityScore} />
                  <CopyBtn text={editedPrompt} large />
                </div>
              </div>

              {/* Editable prompt */}
              <textarea
                value={editedPrompt}
                onChange={e => setEditedPrompt(e.target.value)}
                className="w-full bg-transparent px-5 py-5 text-sm text-white/90 font-mono leading-relaxed focus:outline-none resize-none"
                style={{ minHeight: '280px' }}
                spellCheck={false}
              />

              {/* Footer hint */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-white/40">You can edit this prompt directly above before copying.</p>
                <Link
                  to="/generate"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  Try a prompt from Discover
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
    <section className="max-w-4xl mx-auto px-6 py-32 scroll-reveal">
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

// ── Most Used Prompts (Discover Preview) ─────────────────────────────────────

function MostUsedPrompts() {
  const topPrompts = discoverPrompts.slice(0, 5)
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-12 scroll-reveal">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Discover Prompts</p>
          <h2 className="text-2xl font-black text-white tracking-tight">Most Used Prompts</h2>
        </div>
        <Link to="/discover" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0">
          Browse Discover
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {topPrompts.map((prompt: DiscoverPrompt, i: number) => (
          <a
            key={prompt.id}
            href={prompt.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`glass glass-hover flex flex-col group overflow-hidden transition-all duration-300 ${
              i >= 4 ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div 
              className="h-28 flex items-center justify-center relative overflow-hidden"
              style={{ background: prompt.gradient }}
            >
              {prompt.coverImage ? (
                <img src={prompt.coverImage} alt={prompt.title} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
              )}
              <span className="relative z-10 text-3xl group-hover:scale-110 transition-transform duration-500">{prompt.icon}</span>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="text-[12px] font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                {prompt.title}
              </h3>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed flex-1">
                {prompt.description}
              </p>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{prompt.category}</span>
                <span className="text-[10px] text-purple-400 font-bold">→</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ── Pro Collection Section ───────────────────────────────────────────────────

function ProCollection({ templates }: { templates: Template[] }) {
  if (!templates.length) return null
  
  // Best 5 for desktop, 4 for mobile
  const topTemplates = templates.slice(0, 5)

  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-32 scroll-reveal">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Our Collection</p>
          <h2 className="text-2xl font-black text-white tracking-tight">Pro Collection</h2>
        </div>
        <Link to="/discover" className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0">
          View All
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {topTemplates.map((t, i) => (
          <div 
            key={t.id} 
            className={`h-full ${i >= 4 ? 'hidden lg:block' : ''}`}
          >
            <PromptCard template={t} />
          </div>
        ))}
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
    
  useEffect(() => {
    // Setup Scroll Reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [templates])

  // Interactive 3D Hover Effect for Hero Text
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    e.currentTarget.style.transform = `scale(1.02) perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateZ(10px)`
  }
  const handleHeroMouseLeave = (e: React.MouseEvent<HTMLHeadingElement>) => {
    e.currentTarget.style.transform = `scale(1) perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)`
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="absolute pointer-events-none inset-0 overflow-hidden">
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '20%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }} />
        </div>

        {/* Badge - Much smaller */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 animate-fade-in" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[11px] font-medium text-purple-300 tracking-wide">Free AI prompt engineer</span>
        </div>

        {/* Headline - Bigger, bolder, centered */}
        <div style={{ perspective: '1000px' }}>
          <h1 
            className="interactive-hover-text text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 animate-slide-up"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
          >
            <span className="text-white pointer-events-none">Any idea.</span>
            <br />
            <span className="gradient-text pointer-events-none">Perfect prompt.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your cheat code to AI that just works
        </p>

        {/* Generator */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <AIGenerator />
        </div>
      </section>

      {/* How to use */}
      <HowToUse />

      {/* Prompts Discovery */}
      <MostUsedPrompts />

      {/* Pro Collection */}
      <ProCollection templates={templates} />

      {/* Let's Connect Footer (Floating Animated Card) */}
      <section className="relative px-6 py-32 mt-10 overflow-hidden bg-transparent">
        <div className="max-w-5xl mx-auto scroll-reveal translate-y-[40px] opacity-0 transition-all duration-1000 ease-out will-change-transform">
          <div className="relative rounded-[2rem] p-12 md:p-16 overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-purple-500/20"
            style={{ 
              background: 'var(--glass-bg, rgba(15, 15, 20, 0.8))',
              border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
              backdropFilter: 'blur(30px)'
            }}
          >
            {/* Animated Spiral / Blob Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-30 z-0 scale-150">
              <div 
                className="absolute inset-0 rounded-full blur-[80px] mix-blend-screen"
                style={{
                  background: 'conic-gradient(from 0deg, #7c3aed, #06b6d4, #ea580c, #7c3aed)',
                  animation: 'blob-spin 10s linear infinite'
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              {/* Left Side: Text */}
              <div className="w-full md:w-1/2">
                <p className="text-sm font-bold text-[var(--accent)] uppercase tracking-widest mb-4">Got an idea?</p>
                <h2 className="text-5xl sm:text-6xl font-black leading-tight text-[var(--text)] mb-8">
                  Let&apos;s build something <span className="gradient-text block mt-2">amazing.</span>
                </h2>
                <a 
                  href="https://mail.google.com/mail/?view=cm&to=abhiramaanil@gmail.com&su=Project%20Inquiry%20from%20Prompt%20Engine&body=Hi%20Abhiram%2C%0A%0AI%20found%20your%20Prompt%20Engine%20and%20would%20love%20to%20discuss%20a%20project!%0A%0A"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  Start a Project
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  or email directly: <a href="mailto:abhiramaanil@gmail.com" className="text-[var(--accent)] hover:underline">abhiramaanil@gmail.com</a>
                </p>
              </div>

              {/* Right Side: Socials & Contact Info */}
              <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-6 justify-center md:justify-end">
                <div className="glass p-6 rounded-2xl flex-1 max-w-full sm:max-w-[200px] flex flex-col items-center sm:items-start text-center sm:text-left" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-4 font-bold">Socials</p>
                  <div className="flex flex-col gap-4 sm:gap-3 w-full">
                    <a href="https://www.linkedin.com/in/abhiram-anil-092946223/" target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--text)] hover:text-white transition-colors flex items-center justify-center sm:justify-start group w-full">
                      <svg className="w-4 h-4 mr-2 text-[var(--muted)] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      LinkedIn 
                      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--accent)] ml-auto hidden sm:inline-block">↗</span>
                    </a>
                    <a href="https://www.instagram.com/__ab_10__/" target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--text)] hover:text-white transition-colors flex items-center justify-center sm:justify-start group w-full">
                      <svg className="w-4 h-4 mr-2 text-[var(--muted)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      Instagram 
                      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--accent)] ml-auto hidden sm:inline-block">↗</span>
                    </a>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl flex-1 max-w-full sm:max-w-[220px] flex flex-col items-center sm:items-start text-center sm:text-left" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-4 font-bold">Inquiries</p>
                  <div className="flex flex-col gap-4 sm:gap-3 w-full items-center sm:items-start">
                    <a href="mailto:abhiramaanil@gmail.com" className="text-sm font-medium text-[var(--text)] hover:text-white transition-colors truncate block">
                      abhiramaanil@gmail.com
                    </a>
                    <a href="tel:8547562600" className="text-sm font-medium text-[var(--text)] hover:text-white transition-colors block">
                      +91 8547 562 600
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
