import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Template } from '../types'
import { Badge } from '../components/ui/Badge'

const CATEGORY_ICONS: Record<string, string> = {
  Development:'⚡', Analytics:'📊', Content:'✍️', Support:'💬',
  Communication:'📧', Marketing:'📱', Research:'🔬',
  Education:'🎓', Product:'🚀', Creativity:'💡',
}

function CopyBlock({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {label && (
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="text-xs text-gray-500 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/8 transition-all"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-5 text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">{text}</pre>
    </div>
  )
}

export function DiscoverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState<'template' | 'examples' | 'tips'>('template')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.templates.get(id)
      .then(t => { setTemplate(t); setLoading(false); api.analytics.track('prompt_viewed', id) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
      <div className="glass h-8 w-48 skeleton" />
      <div className="glass h-12 w-80 skeleton" />
      <div className="glass h-64 skeleton" />
    </div>
  )

  if (error || !template) return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-gray-400 mb-2">{error || 'Prompt not found'}</p>
      <Link to="/discover" className="text-sm text-purple-400 hover:text-purple-300">← Back to Discover</Link>
    </div>
  )

  const icon = CATEGORY_ICONS[template.category] || '✦'
  const tabs = [
    { key: 'template', label: 'Prompt Template',  count: null },
    { key: 'examples', label: 'Examples',  count: template.examples?.length ?? 0 },
    { key: 'tips',     label: 'Tactical Tips',  count: template.proTips?.length ?? 0 },
  ] as const

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back */}
      <Link to="/discover" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-10">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Discover
      </Link>

      {/* Header card */}
      <div className="glass p-6 sm:p-8 rounded-2xl mb-8 relative overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <Badge label={template.category} category={template.category} />
                <span className="text-xs text-gray-600">{template.domain}</span>
                <span className="text-xs font-semibold text-emerald-400">{template.qualityScore}/30 ⭐</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1.5">{template.name}</h1>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
          </div>

          <Link
            to={`/generate?template=${template.id}`}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:opacity-90 transition-all active:scale-95 shrink-0"
          >
            Use this prompt
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Brackets (placeholders) */}
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

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${tab === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t.label}{t.count !== null ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'template' && (
          <div className="space-y-5">
            {template.mainTemplate
              ? <CopyBlock text={template.mainTemplate} label="Main template" />
              : <p className="text-gray-600 text-sm text-center py-10">Load the backend to see the full template.</p>
            }
            {template.quickTemplate && (
              <CopyBlock text={template.quickTemplate} label="Quick fill version (5 key fields)" />
            )}
          </div>
        )}

        {tab === 'examples' && (
          <div className="space-y-5">
            {template.examples?.length
              ? template.examples.map((ex, i) => (
                  <CopyBlock key={i} text={ex} label={`Real example ${i + 1}`} />
                ))
              : <p className="text-gray-600 text-sm text-center py-10">No examples available.</p>
            }
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
              : <p className="text-gray-600 text-sm text-center py-10">No tips available.</p>
            }
          </div>
        )}
      </div>
    </div>
  )
}
