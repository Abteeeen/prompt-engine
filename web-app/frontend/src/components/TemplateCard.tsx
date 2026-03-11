import React from 'react'
import { Link } from 'react-router-dom'
import type { Template } from '../types'
import { Badge } from './ui/Badge'

const CATEGORY_ICONS: Record<string, string> = {
  Development:   '⚡',
  Analytics:     '📊',
  Content:       '✍️',
  Support:       '💬',
  Communication: '📧',
  Marketing:     '📱',
  Research:      '🔬',
  Education:     '🎓',
  Product:       '🚀',
  Creativity:    '💡',
}

function ScoreDots({ score }: { score: number }) {
  const pct = Math.round((score / 30) * 100)
  const color = pct >= 90 ? '#10B981' : pct >= 75 ? '#3B82F6' : '#8B5CF6'
  return (
    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      {score}/30
    </span>
  )
}

interface Props {
  template: Template
  compact?: boolean
}

export function TemplateCard({ template, compact }: Props) {
  const icon = CATEGORY_ICONS[template.category] || '✦'

  if (compact) {
    return (
      <Link
        to={`/templates/${template.id}`}
        className="glass glass-hover flex items-start gap-3 p-4 group"
      >
        <span className="text-xl shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">{template.name}</p>
            <ScoreDots score={template.qualityScore} />
          </div>
          <p className="text-xs text-gray-500 truncate">{template.description}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/templates/${template.id}`} className="glass glass-hover flex flex-col p-5 group h-full overflow-hidden min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
          {icon}
        </div>
        <ScoreDots score={template.qualityScore} />
      </div>

      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors">{template.name}</h3>
      <p className="text-xs text-gray-500 leading-relaxed flex-1">{template.description}</p>

      <div className="flex items-center justify-between mt-4 pt-4 gap-2 min-w-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="shrink-0 truncate max-w-[60%] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
          style={{
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.25)',
            color: '#a78bfa'
          }}>
          {template.category}
        </span>
        <span className="shrink-0 text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 whitespace-nowrap">
          Try it
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </Link>
  )
}
