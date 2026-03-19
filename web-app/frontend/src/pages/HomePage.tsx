import React, { useEffect, useState, useRef } from 'react'

import { Link } from 'react-router-dom'

import { api } from '../services/api'

import type { Template, QualityScore } from '../types'

import { PromptCard } from '../components/PromptCard'

import { QualityScoreMini } from '../components/QualityScore'

import PromptHistory, { saveToHistory, type HistoryItem } from '../components/PromptHistory'
import { ArenaModal } from '../components/ArenaModal'



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
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isArenaLoading, setIsArenaLoading] = useState(false)
  const [arenaResults, setArenaResults] = useState<{ results: any[]; jury: any } | null>(null)
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false)
  const [securityStatus, setSecurityStatus] = useState<{ isSafe: boolean; riskLevel: string } | null>(null)
  const [remainingTries, setRemainingTries] = useState<number | string | null>(null)
  const [usedTries, setUsedTries] = useState<number>(0)
  const [limitTries, setLimitTries] = useState<number>(15)

  const [promptType, setPromptType] = useState<PromptType>('auto')

  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const [fileName, setFileName] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resultRef = useRef<HTMLDivElement>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)



  // Close dropdown when clicking outside

  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {

      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {

        setShowTypeDropdown(false)

      }

    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)

  }, [])



  useEffect(() => {

    // Initial quota check

    api.prompts.getQuota().then(q => {

      setRemainingTries(q.remaining)

      setUsedTries(q.totalUsed)

      setLimitTries(q.limit)

    })

  }, [])



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

      if (data.security) setSecurityStatus(data.security)



      // Refresh quota

      api.prompts.getQuota().then(q => {

        setRemainingTries(q.remaining)

        setUsedTries(q.totalUsed)

      })

      

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



  const handleOptimizeInput = async () => {

    if (input.trim().length < 5) return

    setIsOptimizing(true)

    setError('')

    try {

      const data = await api.ai.optimize(input)

      setInput(data.optimized)

    } catch (err: any) {

      setError('Optimization failed: ' + err.message)

    } finally {

      setIsOptimizing(false)

    }

  }



  const handleArenaRequest = async (text: string) => {

    setIsArenaLoading(true)

    try {

      const data = await api.ai.arena(text)

      setArenaResults(data)

      setIsArenaModalOpen(true)

    } catch (err: any) {

      setError('Arena failed: ' + err.message)

    } finally {

      setIsArenaLoading(false)

    }

  }



  const handleKey = (e: React.KeyboardEvent) => {

    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {

      e.preventDefault()

      generate()

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

      

      <div className="w-full max-w-3xl mx-auto">



        {/* Header with Quota */}

        <div className="flex items-center justify-between mb-4">

          <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Autonomous Generator v2</div>

          {remainingTries !== null && (

            <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">

              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />

              <span className="text-[11px] font-bold text-purple-300">

                {remainingTries === 'Unlimited' ? 'Quota: Unlimited' : `Tries Left: ${remainingTries}`}

              </span>

            </div>

          )}

        </div>



        {/* Main Input Container */}

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

          {/* Textarea */}

          <textarea

            ref={textareaRef}

            value={input}

            onChange={e => setInput(e.target.value)}

            onKeyDown={handleKey}

            placeholder="Describe what you need a prompt for..."

            rows={5}

            className="w-full bg-transparent px-6 pt-6 pb-20 text-white placeholder:text-white/30 focus:outline-none text-base leading-relaxed resize-none"

            style={{ minHeight: '140px' }}

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



          {/* Bottom Bar */}

          <div className="absolute bottom-0 left-0 right-0 h-14 px-4 flex items-center justify-between bg-gradient-to-t from-black/20 to-transparent">

            {/* Left: Prompt Type & File Upload */}

            <div className="flex items-center gap-2">

              {/* Prompt Type Dropdown */}

              <div className="relative" ref={dropdownRef}>

                <button

                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}

                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium text-white/70 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all"

                >

                  <span className="text-white/50">Type:</span>

                  <span className="text-white/90">{PROMPT_TYPE_CONFIG[promptType].label}</span>

                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />

                </button>



                {/* Dropdown Menu - Opens Downward */}

                {showTypeDropdown && (

                  <div 

                    className="absolute top-full left-0 mt-2 min-w-[220px] max-h-[280px] overflow-y-auto rounded-xl overflow-hidden z-[9999]"

                    style={{

                      background: 'rgba(15, 15, 25, 0.98)',

                      border: '1px solid rgba(139, 92, 246, 0.25)',

                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',

                    }}

                  >

                    {(Object.keys(PROMPT_TYPE_CONFIG) as PromptType[]).map((type) => (

                      <button

                        key={type}

                        onClick={() => {

                          setPromptType(type)

                          setShowTypeDropdown(false)

                        }}

                        className={`w-full px-3 py-1.5 text-left text-[10px] transition-colors flex items-center justify-between ${

                          promptType === type 

                            ? 'bg-purple-500/15 text-white' 

                            : 'text-white/70 hover:bg-white/[0.05] hover:text-white'

                        }`}

                      >

                        <div>

                          <span className="font-medium">{PROMPT_TYPE_CONFIG[type].label}</span>

                          <p className="text-[9px] text-white/40 mt-0">{PROMPT_TYPE_CONFIG[type].hint}</p>

                        </div>

                        {promptType === type && (

                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />

                        )}

                      </button>

                    ))}

                  </div>

                )}

              </div>



              {/* File Upload Button */}

              <input

                ref={fileRef}

                type="file"

                accept=".txt,.md,.csv,.json,.log"

                className="hidden"

                onChange={handleFileUpload}

              />

              <button

                onClick={() => fileRef.current?.click()}

                className="flex items-center justify-center w-9 h-9 rounded-xl text-white/50 hover:text-white/80 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all"

                title="Upload context file"

              >

                <PaperclipIcon className="w-4 h-4" />

              </button>

            </div>



            {/* Right: Character count & Send Button */}

            <div className="flex items-center gap-3">

              <span className="text-xs text-white/30 hidden sm:inline">

                {input.length > 0 ? `${input.length} chars` : 'Ctrl+Enter'}

              </span>



              <button

                onClick={handleOptimizeInput}

                disabled={isOptimizing || input.trim().length < 5}

                title="Optimize Input (Autonomous Optimizer)"

                className="px-3 py-2 rounded-xl text-[10px] font-bold text-purple-400 hover:text-white hover:bg-purple-500/20 border border-purple-500/15 disabled:opacity-30 transition-all flex items-center gap-1"

              >

                {isOptimizing ? '✨...' : '✨ Optimize'}

              </button>



              <button

                onClick={() => generate()}

                disabled={loading || input.trim().length < 5}

                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:scale-100"

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

          </div>

        </div>



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

                    {result.source === 'groq' ? '· AI-powered' : '· Template engine'}

                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <button

                    onClick={() => handleArenaRequest(editedPrompt)}

                    disabled={isArenaLoading}

                    className="h-8 px-3 rounded-lg text-xs font-semibold text-purple-400 hover:text-white hover:bg-purple-500/20 border border-purple-500/15 transition-all flex items-center gap-1"

                  >

                    {isArenaLoading ? '⚔️...' : '⚔️ Arena'}

                  </button>

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

                  Use a template instead

                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>

                </Link>

              </div>

            </div>

          </div>

        )}

      </div>



      {/* Arena Modal */}

      {arenaResults && (

        <ArenaModal

          isOpen={isArenaModalOpen}

          onClose={() => setIsArenaModalOpen(false)}

          results={arenaResults.results}

          jury={arenaResults.jury}

          prompt={editedPrompt}

        />

      )}

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

    <section className="max-w-4xl mx-auto px-6 py-32">

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

    <section className="max-w-6xl mx-auto px-6 pt-8 pb-32">

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



export function HomePage() {

  const [templates, setTemplates] = useState<Template[]>([])



  useEffect(() => {

    api.templates.list().then(setTemplates).catch(() => { })

    api.analytics.track('page_view', undefined, { page: 'home' })

  }, [])



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



        {/* Badge - Much smaller, positioned for better balance */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full animate-fade-in" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
            <span className="text-[12px] font-bold text-purple-200 tracking-wider">CREW SPECIAL: FREE AI PROMPT ENGINEER</span>
          </div>
        </div>



        <div className="relative inline-block perspective-[1000px]">
          <h1 
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 animate-slide-up interactive-hover-text"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              el.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${y * -15}deg) scale(1.02)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
            }}
          >
            <span className="text-white">Any idea.</span>
            <br />
            <span className="gradient-text">Perfect prompt.</span>
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



      {/* Templates */}
      <TemplatesPreview templates={templates} />

      {/* Contact Section - Restored Spiral Version */}
      <section className="relative px-6 py-32 mt-10 overflow-hidden bg-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[2rem] p-12 md:p-16 overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-purple-500/20"
            style={{ 
              background: 'rgba(15, 15, 20, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
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
                <p className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Got an idea?</p>
                <h2 className="text-5xl sm:text-6xl font-black leading-tight text-white mb-8">
                  Let&apos;s build something <span className="gradient-text block mt-2">amazing.</span>
                </h2>
                <a 
                  href="mailto:abhiramaanil@gmail.com" 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  Start a Project
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
              </div>

              {/* Right Side: Socials & Contact Info */}
              <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-6 justify-center md:justify-end">
                <div className="glass p-6 rounded-2xl flex-1 max-w-[200px]" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Socials</p>
                  <div className="flex flex-col gap-3">
                    <a href="https://www.linkedin.com/in/abhiram-anil-092946223/" target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-purple-400 transition-colors flex items-center justify-between group">
                      LinkedIn <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                    </a>
                    <a href="https://www.instagram.com/__ab_10__/" target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-purple-400 transition-colors flex items-center justify-between group">
                      Instagram <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                    </a>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl flex-1 max-w-[220px]" style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-bold">Inquiries</p>
                  <div className="flex flex-col gap-3 text-left">
                    <a href="mailto:abhiramaanil@gmail.com" className="text-sm font-medium text-white hover:text-purple-400 transition-colors truncate block">
                      abhiramaanil@gmail.com
                    </a>
                    <a href="tel:+918547562600" className="text-sm font-medium text-white hover:text-purple-400 transition-colors block">
                      +91 8547 562 600
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] font-medium">© 2026 Prompt Engineering Science. Built by the Crew.</p>
          </div>
        </div>
      </section>
    </div>
  )
}


