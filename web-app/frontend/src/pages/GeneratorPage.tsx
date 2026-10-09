import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, errorMessage, isQuotaError } from '../services/api'
import type { Template, FormStructure, GenerateResult, FormData } from '../types'
import { DynamicForm } from '../components/DynamicForm'
import { PromptDisplay } from '../components/PromptDisplay'
import { Button } from '../components/ui/Button'
import { QuotaBadge, QuotaNotice } from '../components/Quota'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { SparkleIcon, ThumbsDownIcon, ThumbsUpIcon, Spinner } from '../components/ui/Icons'

type Mode = 'quick' | 'standard' | 'advanced'

function TemplateSelector({ templates, selected, onSelect }: { templates: Template[]; selected: string | null; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()
  const shown = q ? templates.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) : templates

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter templates..." className="input-base mb-4" aria-label="Filter templates" />
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
        {shown.length === 0 && <p className="text-xs text-gray-500 py-6 text-center">No templates match “{search}”.</p>}
      </div>
    </div>
  )
}

export default function GeneratorPage() {
  usePageTitle('Generate')
  const { applyUsage } = useAuth()
  const [searchParams] = useSearchParams()
  const preselect = searchParams.get('template')

  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesError, setTemplatesError] = useState('')
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selected, setSelected] = useState<string | null>(preselect)
  const [form, setForm] = useState<FormStructure | null>(null)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState<FormData>({})
  const [mode, setMode] = useState<Mode>('standard')
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [resultKey, setResultKey] = useState(0)
  const [outputState, setOutputState] = useState<{ selectedIndex: number; editedText: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [quotaMessage, setQuotaMessage] = useState('')
  const [loadingForm, setLoadingForm] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [notice, setNotice] = useState('')
  const [rated, setRated] = useState<'good' | 'bad' | null>(null)

  const selectedTemplate = useMemo(() => templates.find(t => t.id === selected) ?? null, [templates, selected])
  const filledCount = form ? form.fields.filter(f => formData[f.name]?.trim()).length : 0
  const requiredCount = form ? form.fields.filter(f => f.required).length : 0
  const canGenerate = !!selected && !!form && filledCount >= Math.min(requiredCount, 2)

  const loadTemplates = useCallback(() => {
    setLoadingTemplates(true)
    setTemplatesError('')
    api.templates
      .list()
      .then(setTemplates)
      .catch(err => setTemplatesError(errorMessage(err, 'Could not load templates.')))
      .finally(() => setLoadingTemplates(false))
  }, [])

  useEffect(() => {
    loadTemplates()
    api.analytics.track('page_view', undefined, { page: 'generator' })
  }, [loadTemplates])

  // Load form when template or mode changes
  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setLoadingForm(true)
    setFormError('')
    setFormData({})
    setResult(null)
    setRated(null)
    setNotice('')
    api.forms
      .get(selected, mode)
      .then(f => {
        if (!cancelled) setForm(f)
      })
      .catch(err => {
        if (!cancelled) setFormError(errorMessage(err, 'Could not load this template’s form.'))
      })
      .finally(() => {
        if (!cancelled) setLoadingForm(false)
      })
    return () => {
      cancelled = true
    }
  }, [selected, mode])

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleGenerate = async () => {
    if (!selected || !form) return
    setGenerating(true)
    setError('')
    setQuotaMessage('')
    setNotice('')
    setRated(null)
    try {
      const res = await api.templates.fill(selected, formData)
      setResult(res)
      setResultKey(k => k + 1)
      applyUsage(res.usage)
      const first = res.variations[0]?.text ?? res.prompt
      setOutputState({ selectedIndex: 0, editedText: first })
      api.analytics.track('prompt_generated', selected, {
        qualityScore: res.qualityScore.overallScore,
        mode,
        filledCount,
        requiredCount,
        promptLength: res.prompt.length,
      })
    } catch (err) {
      if (isQuotaError(err)) {
        applyUsage(err.usage)
        setQuotaMessage(err.message)
      } else {
        setError(errorMessage(err, 'Generation failed'))
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleOptimize = async () => {
    const rawContext = Object.values(formData).filter(Boolean).join('; ')
    if (!rawContext) {
      setError('Fill in a few fields first so there is something to optimize.')
      return
    }
    setIsOptimizing(true)
    setError('')
    setNotice('')
    try {
      const data = await api.ai.optimize(rawContext)
      applyUsage(data.usage)
      const targetField = form?.fields[0]?.name || 'topic'
      setFormData(prev => ({ ...prev, [targetField]: data.optimized }))
      setNotice(`Optimized input placed in “${form?.fields[0]?.label || targetField}”. Review it, then generate.`)
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

  const handleResultOptimize = async (text: string) => {
    if (!result) return
    setIsOptimizing(true)
    setError('')
    try {
      const data = await api.ai.optimize(text)
      applyUsage(data.usage)
      const idx = outputState?.selectedIndex ?? 0
      const variations = result.variations.map((v, i) => (i === idx ? { ...v, text: data.optimized } : v))
      setResult({ ...result, variations, prompt: idx === 0 ? data.optimized : result.prompt })
      setResultKey(k => k + 1)
      setOutputState({ selectedIndex: idx, editedText: data.optimized })
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

  const trackCopy = () => {
    if (!selected || !result) return
    api.analytics.track('prompt_copied', selected, {
      variation: result.variations[outputState?.selectedIndex || 0]?.label,
      qualityScore: result.qualityScore.overallScore,
    })
  }

  const rate = (rating: 'good' | 'bad') => {
    if (!selected || !result) return
    setRated(rating)
    api.analytics.track('prompt_rated', selected, {
      rating,
      variation: result.variations[outputState?.selectedIndex || 0]?.label,
      qualityScore: result.qualityScore.overallScore,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Prompt Generator</h1>
        <p className="text-sm text-gray-500">Pick a template, fill the form, get a scored prompt in 60 seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_400px] gap-6">
        {/* Column 1: template selector */}
        <div className="glass p-4 rounded-2xl h-fit lg:sticky lg:top-24">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">1. Choose template</h2>
          {loadingTemplates && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 skeleton" />)}
            </div>
          )}
          {!loadingTemplates && templatesError && (
            <div className="p-3 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {templatesError} <button onClick={loadTemplates} className="underline hover:text-red-300">Retry</button>
            </div>
          )}
          {!loadingTemplates && !templatesError && <TemplateSelector templates={templates} selected={selected} onSelect={setSelected} />}
        </div>

        {/* Column 2: form */}
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Fill the form</h2>
              <QuotaBadge />
            </div>
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
              <p className="text-sm">Select a template to begin</p>
            </div>
          )}

          {selected && loadingForm && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 skeleton" />)}
            </div>
          )}

          {selected && !loadingForm && formError && (
            <div className="p-4 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {formError}
            </div>
          )}

          {selected && form && !loadingForm && !formError && (
            <>
              <DynamicForm fields={form.fields} values={formData} onChange={handleFieldChange} />

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

              <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>{filledCount} / {form.fields.length} filled</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full bg-gradient-brand transition-all duration-500" style={{ width: `${form.fields.length ? (filledCount / form.fields.length) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing || !selected}
                    title="Rewrite your inputs so the template produces a better prompt"
                    className="h-12 px-3 rounded-xl text-xs font-bold text-purple-400 hover:text-white hover:bg-purple-500/20 border border-purple-500/20 disabled:opacity-30 transition-all flex items-center gap-1.5"
                  >
                    {isOptimizing ? <Spinner className="w-3.5 h-3.5" /> : <SparkleIcon className="w-3.5 h-3.5" />}
                    Optimize
                  </button>
                  <Button variant="primary" size="lg" loading={generating} disabled={!canGenerate && !generating} onClick={handleGenerate}>
                    {generating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>

              {notice && <p className="text-xs text-emerald-400 mt-3">{notice}</p>}
              {quotaMessage && <QuotaNotice message={quotaMessage} onSignedIn={() => void handleGenerate()} />}
              {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
            </>
          )}
        </div>

        {/* Column 3: output */}
        <div className="glass p-5 rounded-2xl h-fit lg:sticky lg:top-24">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">3. Your prompt</h2>

          {!result && !generating && (
            <div className="py-16 text-center text-gray-600">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-purple-400 animate-float" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <SparkleIcon className="w-5 h-5" />
              </div>
              <p className="text-sm">Your generated prompt will appear here</p>
              <p className="text-xs text-gray-700 mt-1">with a real-time quality score</p>
            </div>
          )}

          {generating && (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-brand flex items-center justify-center animate-pulse-glow">
                <Spinner className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-400">Crafting your prompt...</p>
            </div>
          )}

          {result && !generating && (
            <>
              <PromptDisplay
                key={resultKey}
                result={result}
                domain={selectedTemplate?.domain ?? null}
                onStateChange={setOutputState}
                onCopy={trackCopy}
                onOptimize={handleResultOptimize}
                optimizing={isOptimizing}
              />
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">{rated ? 'Thanks for the feedback.' : 'Was this prompt helpful?'}</p>
                <div className="flex gap-3">
                  <Button variant="secondary" size="sm" onClick={() => rate('good')} className={rated === 'good' ? 'border-emerald-500/40 text-emerald-300' : ''}>
                    <ThumbsUpIcon className="w-3.5 h-3.5" /> Great prompt
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => rate('bad')} className={rated === 'bad' ? 'border-amber-500/40 text-amber-300' : ''}>
                    <ThumbsDownIcon className="w-3.5 h-3.5" /> Needs work
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
