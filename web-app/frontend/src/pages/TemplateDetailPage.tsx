import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, errorMessage } from '../services/api'
import type { Template } from '../types'
import { Badge } from '../components/ui/Badge'
import { getCategoryStyle } from '../components/PromptCard'
import { usePageTitle } from '../hooks/usePageTitle'
import { ArrowLeftIcon } from '../components/ui/Icons'

function CopyBlock({ text, label }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 2000)
  }
  return (
    <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {label && (
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
          <button onClick={copy} className="text-xs text-gray-500 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/8 transition-all">
            {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-5 text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">{text}</pre>
    </div>
  )
}

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'template' | 'examples' | 'tips'>('template')
  usePageTitle(template?.name ?? 'Template')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError('')
    api.templates
      .get(id)
      .then(t => {
        if (cancelled) return
        setTemplate(t)
        api.analytics.track('prompt_viewed', id)
      })
      .catch(err => {
        if (!cancelled) setError(errorMessage(err, 'Template not found'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        <div className="h-8 w-48 skeleton" />
        <div className="h-12 w-80 max-w-full skeleton" />
        <div className="h-64 skeleton" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-gray-400 mb-4">{error || 'Template not found'}</p>
        <Link to="/templates" className="text-sm text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5">
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Templates
        </Link>
      </div>
    )
  }

  const style = getCategoryStyle(template.category)
  const tabs = [
    { key: 'template', label: 'Prompt template', count: null },
    { key: 'examples', label: 'Examples', count: template.examples?.length ?? 0 },
    { key: 'tips', label: 'Tactical tips', count: template.proTips?.length ?? 0 },
  ] as const

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/templates" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-10">
        <ArrowLeftIcon className="w-3 h-3" strokeWidth={2.5} />
        Back to Templates
      </Link>

      <div className="glass p-6 sm:p-8 rounded-2xl mb-8 relative overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white/90" style={{ background: style.gradient }}>
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{style.icon}</svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <Badge label={template.category} category={template.category} />
                <span className="text-xs text-gray-600">{template.domain}</span>
                <span className="text-xs font-semibold text-emerald-400">{template.qualityScore}/30</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1.5">{template.name}</h1>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
          </div>

          <Link
            to={`/generate?template=${encodeURIComponent(template.id)}`}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:opacity-90 transition-all active:scale-95 shrink-0"
          >
            Use this template
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {template.brackets && template.brackets.length > 0 && (
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-gray-600 mb-2.5 font-semibold uppercase tracking-wide">Form fields this template generates</p>
            <div className="flex flex-wrap gap-2">
              {template.brackets.map(b => (
                <span key={b} className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                  [{b}]
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit max-w-full overflow-x-auto no-scrollbar" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${tab === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t.label}{t.count !== null ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === 'template' && (
          <div className="space-y-5">
            {template.mainTemplate
              ? <CopyBlock text={template.mainTemplate} label="Main template" />
              : <p className="text-gray-600 text-sm text-center py-10">The full template text is not available right now.</p>}
            {template.quickTemplate && <CopyBlock text={template.quickTemplate} label="Quick fill version (5 key fields)" />}
          </div>
        )}

        {tab === 'examples' && (
          <div className="space-y-5">
            {template.examples?.length
              ? template.examples.map((ex, i) => <CopyBlock key={i} text={ex} label={`Real example ${i + 1}`} />)
              : <p className="text-gray-600 text-sm text-center py-10">No examples available.</p>}
          </div>
        )}

        {tab === 'tips' && (
          <div className="glass p-6 rounded-2xl space-y-4">
            {template.proTips?.length
              ? template.proTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-purple-400" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                  </div>
                ))
              : <p className="text-gray-600 text-sm text-center py-10">No tips available.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
