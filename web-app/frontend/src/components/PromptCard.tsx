import React from 'react'
import { Link } from 'react-router-dom'
import type { Template } from '../types'

export interface CategoryStyle {
  icon: React.ReactNode
  gradient: string
  color: string
  coverImage: string
}

const ART = {
  writing: '/images/categories/writing.png',
  development: '/images/categories/development.png',
  research: '/images/categories/research.png',
  marketing: '/images/categories/marketing.png',
  planning: '/images/categories/planning.png',
  multimedia: '/images/categories/multimedia.png',
  automation: '/images/categories/automation.png',
}

const ICONS = {
  pen: <path d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-1.5 M2 22l5-1 12-12-4-4-12 12-1 5z" />,
  code: <path d="M16 18l6-6-6-6 M8 6l-6 6 6 6 M12 4.5l-2 15" />,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  megaphone: <path d="M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07" />,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  chart: <path d="M12 20V10M18 20V4M6 20v-4" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  dollar: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  cap: <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
  people: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  layers: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
}

const PALETTE = {
  amber: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fbbf24' },
  blue: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#60a5fa' },
  teal: { gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', color: '#2dd4bf' },
  pink: { gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#f472b6' },
  violet: { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#a78bfa' },
  deepViolet: { gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', color: '#a78bfa' },
  green: { gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#34d399' },
  indigo: { gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#818cf8' },
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Writing: { icon: ICONS.pen, ...PALETTE.amber, coverImage: ART.writing },
  Content: { icon: ICONS.pen, ...PALETTE.amber, coverImage: ART.writing },
  Creativity: { icon: ICONS.star, ...PALETTE.amber, coverImage: ART.writing },
  Education: { icon: ICONS.cap, ...PALETTE.teal, coverImage: ART.writing },
  Communication: { icon: ICONS.chat, ...PALETTE.pink, coverImage: ART.marketing },
  Development: { icon: ICONS.code, ...PALETTE.blue, coverImage: ART.development },
  Support: { icon: ICONS.shield, ...PALETTE.blue, coverImage: ART.development },
  Research: { icon: ICONS.search, ...PALETTE.teal, coverImage: ART.research },
  Analytics: { icon: ICONS.chart, ...PALETTE.teal, coverImage: ART.research },
  Marketing: { icon: ICONS.megaphone, ...PALETTE.pink, coverImage: ART.marketing },
  Sales: { icon: ICONS.dollar, ...PALETTE.pink, coverImage: ART.marketing },
  Business: { icon: ICONS.calendar, ...PALETTE.violet, coverImage: ART.planning },
  Planning: { icon: ICONS.calendar, ...PALETTE.violet, coverImage: ART.planning },
  Product: { icon: ICONS.layers, ...PALETTE.violet, coverImage: ART.planning },
  Productivity: { icon: ICONS.calendar, ...PALETTE.violet, coverImage: ART.planning },
  Legal: { icon: ICONS.shield, ...PALETTE.violet, coverImage: ART.planning },
  HR: { icon: ICONS.people, ...PALETTE.violet, coverImage: ART.planning },
  Multimedia: { icon: ICONS.star, ...PALETTE.deepViolet, coverImage: ART.multimedia },
  Design: { icon: ICONS.star, ...PALETTE.deepViolet, coverImage: ART.multimedia },
  Automation: { icon: ICONS.gear, ...PALETTE.green, coverImage: ART.automation },
}

const DEFAULT_STYLE: CategoryStyle = { icon: ICONS.layers, ...PALETTE.indigo, coverImage: ART.planning }

/** Visual treatment (icon, gradient, cover art) for a template category. */
export function getCategoryStyle(category: string): CategoryStyle {
  if (CATEGORY_STYLES[category]) return CATEGORY_STYLES[category]
  const c = category.toLowerCase()
  if (/writ|content|copy|blog|email/.test(c)) return CATEGORY_STYLES.Writing
  if (/dev|code|engineer|tech/.test(c)) return CATEGORY_STYLES.Development
  if (/research|seo|analy|data/.test(c)) return CATEGORY_STYLES.Research
  if (/market|sales|growth|social/.test(c)) return CATEGORY_STYLES.Marketing
  if (/image|video|media|design|art/.test(c)) return CATEGORY_STYLES.Multimedia
  if (/automat|workflow|agent/.test(c)) return CATEGORY_STYLES.Automation
  return DEFAULT_STYLE
}

interface Props {
  template: Template
  compact?: boolean
}

export function PromptCard({ template, compact }: Props) {
  const style = getCategoryStyle(template.category)
  const href = `/templates/${encodeURIComponent(template.id)}`
  const wrapper = `glass glass-hover flex flex-col group overflow-hidden transition-all duration-300 ${compact ? 'p-3' : 'p-0 h-full'}`

  if (compact) {
    return (
      <Link to={href} className={wrapper}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white/90 shadow-lg overflow-hidden" style={{ background: style.gradient }}>
            <img src={style.coverImage} alt="" loading="lazy" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">{template.name}</h4>
            <p className="text-[11px] text-gray-500 truncate">{template.category}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={href} className={wrapper}>
      {/* Thumbnail */}
      <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ background: style.gradient }}>
        <img
          src={style.coverImage}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
        />
        <div className="relative z-10 p-4 transition-transform duration-500 group-hover:scale-110">
          <svg className="w-12 h-12 text-white/90 drop-shadow-2xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {style.icon}
          </svg>
        </div>
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/90">
          {template.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors line-clamp-1">{template.name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">{template.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
            <span>{template.qualityScore}/30</span>
            <span className="text-purple-500/50 text-xs">✦</span>
          </div>
          <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1">
            Use this template
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
