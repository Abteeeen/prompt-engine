import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Template, FormStructure, GenerateResult, FormData } from '../types'
import { PromptCard } from '../components/PromptCard'
import { DynamicForm } from '../components/DynamicForm'
import { PromptDisplay } from '../components/PromptDisplay'
import { Button } from '../components/ui/Button'

type Mode = 'quick' | 'standard' | 'advanced'

function TemplateSelector({ templates, selected, onSelect }: { templates: Template[]; selected: string | null; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const shown = search ? templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())) : templates

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Filter prompts..."
        className="input-base mb-4"
      />
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {shown.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left glass glass-hover p-3 flex items-center gap-3 transition-all ${selected === t.id ? 'border-purple-500/50 bg-purple-500/8' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${selected === t.id ? 'bg-purple-400 shadow-lg shadow-purple-400/50' : 'bg-gray-700'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{t.name}</p>
              <p className="text-xs text-gray-500 truncate">{t.domain}</p>
            </div>
            <span className="text-xs text-gray-600 shrink-0">{t.qualityScore}/30</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function GeneratorPage() {
  const [searchParams] = useSearchParams()
  const preselect = searchParams.get('template')

  const [templates, setTemplates]   = useState<Template[]>([])
  const [selected, setSelected]     = useState<string | null>(preselect)
  const [form, setForm]             = useState<FormStructure | null>(null)
  const [formData, setFormData]     = useState<FormData>({})
  const [mode, setMode]             = useState<Mode>('standard')
  const [result, setResult]         = useState<GenerateResult | null>(null)
  const [outputState, setOutputState] = useState<{ selectedIndex: number; editedText: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState('')
  const [loadingForm, setLoadingForm] = useState(false)

  const filledCount = form ? form.fields.filter(f => formData[f.name]?.trim()).length : 0
  const requiredCount = form ? form.fields.filter(f => f.required).length : 0
  const canGenerate = selected && form && filledCount >= Math.min(requiredCount, 2)

  useEffect(() => {
    api.templates.list().then(setTemplates)
    api.analytics.track('page_view', undefined, { page: 'generator' })
  }, [])

  // Load form when template or mode changes
  useEffect(() => {
    if (!selected) return
    setLoadingForm(true)
    setFormData({})
    setResult(null)
    api.forms.get(selected, mode)
      .then(f => { setForm(f); setLoadingForm(false) })
      .catch(() => setLoadingForm(false))
  }, [selected, mode])

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleGenerate = async () => {
    if (!selected || !form) return
    setGenerating(true)
    setError('')
    try {
      const res = await api.prompts.generate(selected, formData)
      setResult(res)
      setOutputState({ selectedIndex: 0, editedText: res.variations[0].text })
      api.analytics.track('prompt_generated', selected, {
        qualityScore: res.qualityScore.overallScore,
        mode,
        filledCount,
        requiredCount,
        promptLength: res.prompt.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const levenshtein = (a: string, b: string) => {
    if (a === b) return 0
    const n = a.length, m = b.length
    if (!n) return m
    if (!m) return n
    const dp = new Array(m + 1)
    for (let j = 0; j <= m; j++) dp[j] = j
    for (let i = 1; i <= n; i++) {
      let prev = dp[0]
      dp[0] = i
      for (let j = 1; j <= m; j++) {
        const tmp = dp[j]
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost)
        prev = tmp
      }
    }
    return dp[m]
  }

  const getEditDistance = () => {
    if (!result || !outputState) return null
    const original = result.variations[outputState.selectedIndex]?.text || result.variations[0].text
    const edited = outputState.editedText || ''
    const dist = levenshtein(original, edited)
    const denom = Math.max(1, Math.max(original.length, edited.length))
    return { edited: original !== edited, editDistance: dist / denom, originalLength: original.length, editedLength: edited.length }
  }

  const trackCopy = () => {
    if (!selected || !result) return
    const ed = getEditDistance()
    api.analytics.track('prompt_copied', selected, {
      variation: result.variations[outputState?.selectedIndex || 0]?.label,
      qualityScore: result.qualityScore.overallScore,
      ...(ed || {}),
    })
  }

  const rate = (rating: 'good' | 'bad') => {
    if (!selected || !result) return
    const ed = getEditDistance()
    api.analytics.track('prompt_rated', selected, {
      rating,
      variation: result.variations[outputState?.selectedIndex || 0]?.label,
      qualityScore: result.qualityScore.overallScore,
      ...(ed || {}),
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Prompt Generator</h1>
        <p className="text-sm text-gray-500">Pick a prompt → fill the form → get a scored prompt in 60 seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_400px] gap-6">

        {/* ── COLUMN 1: Template selector ── */}
        <div className="glass p-4 rounded-2xl h-fit lg:sticky lg:top-24">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">1. Choose prompt</h2>
          <TemplateSelector templates={templates} selected={selected} onSelect={setSelected} />
        </div>

        {/* ── COLUMN 2: Form ── */}
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Fill the form</h2>

            {/* Mode selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {(['quick', 'standard', 'advanced'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${mode === m ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {!selected && (
            <div className="py-16 text-center text-gray-600">
              <div className="text-4xl mb-3">←</div>
              <p className="text-sm">Select a prompt from Discover to begin</p>
            </div>
          )}

          {selected && loadingForm && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 skeleton" />)}
            </div>
          )}

          {selected && form && !loadingForm && (
            <>
              <DynamicForm fields={form.fields} values={formData} onChange={handleFieldChange} />

              {/* Pro tips */}
              {form.proTips.length > 0 && mode !== 'quick' && (
                <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">Pro tips</p>
                  <ul className="space-y-1">
                    {form.proTips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-purple-500 shrink-0 mt-0.5">•</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress + Generate */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>{filledCount} / {form.fields.length} filled</span>
                    <span>{requiredCount} required</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                      style={{ width: `${form.fields.length ? (filledCount / form.fields.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  loading={generating}
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                >
                  {generating ? 'Generating...' : 'Generate ✨'}
                </Button>
              </div>

              {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
            </>
          )}
        </div>

        {/* ── COLUMN 3: Output ── */}
        <div className="glass p-5 rounded-2xl h-fit lg:sticky lg:top-24">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">3. Your prompt</h2>

          {!result && !generating && (
            <div className="py-16 text-center text-gray-600">
              <div className="text-4xl mb-3 animate-float">✨</div>
              <p className="text-sm">Your generated prompt will appear here</p>
              <p className="text-xs text-gray-700 mt-1">with real-time quality score</p>
            </div>
          )}

          {generating && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-brand flex items-center justify-center animate-pulse-glow">
                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm text-gray-400">Crafting your prompt...</p>
            </div>
          )}

          {result && (
            <PromptDisplay
              result={result}
              onStateChange={setOutputState}
              onCopy={trackCopy}
            />
          )}
          {result && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Was this prompt helpful?</p>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => rate('good')}>👍 Great prompt</Button>
                <Button variant="secondary" size="sm" onClick={() => rate('bad')}>👎 Needs work</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
