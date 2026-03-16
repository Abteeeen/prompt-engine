import { Link } from 'react-router-dom'
import type { Template } from '../types'
import type { DiscoverPrompt } from '../data/discoverPrompts'

interface CategoryStyle {
  icon: React.ReactNode
  gradient: string
  color: string
  coverImage?: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Writing: {
    icon: <path d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-1.5 M2 22l5-1 12-12-4-4-12 12-1 5z" />,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fbbf24',
    coverImage: '/images/categories/writing.png'
  },
  Development: {
    icon: <path d="M16 18l6-6-6-6 M8 6l-6 6 6 6 M12 4.5l-2 15" />,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#60a5fa',
    coverImage: '/images/categories/development.png'
  },
  Research: {
    icon: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    color: '#2dd4bf',
    coverImage: '/images/categories/research.png'
  },
  'SEO & Research': { // Discovery equivalent
    icon: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    color: '#2dd4bf',
    coverImage: '/images/categories/research.png'
  },
  Marketing: {
    icon: <><path d="M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07" /></>,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    color: '#f472b6',
    coverImage: '/images/categories/marketing.png'
  },
  Business: {
    icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    color: '#a78bfa',
    coverImage: '/images/categories/planning.png'
  },
  Planning: {
    icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    color: '#a78bfa',
    coverImage: '/images/categories/planning.png'
  },
  Multimedia: {
    icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    color: '#a78bfa',
    coverImage: '/images/categories/multimedia.png'
  },
  Automation: {
    icon: <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    color: '#34d399',
    coverImage: '/images/categories/automation.png'
  },
  // Internal Category Mappings
  Analytics: {
    icon: <path d="M12 20V10M18 20V4M6 20v-4" />,
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    color: '#2dd4bf',
    coverImage: '/images/categories/research.png'
  },
  Content: {
    icon: <path d="M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-1.5 M2 22l5-1 12-12-4-4-12 12-1 5z" />,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fbbf24',
    coverImage: '/images/categories/writing.png'
  },
  Support: {
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#60a5fa',
    coverImage: '/images/categories/development.png'
  },
  Communication: {
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    color: '#f472b6',
    coverImage: '/images/categories/marketing.png'
  },
  Sales: {
    icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    color: '#f472b6',
    coverImage: '/images/categories/marketing.png'
  },
  Legal: {
    icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    color: '#a78bfa',
    coverImage: '/images/categories/planning.png'
  }
}

const DEFAULT_STYLE: CategoryStyle = {
  icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  color: '#818cf8'
}

interface Props {
  template?: Template
  prompt?: DiscoverPrompt
  compact?: boolean
}

export function PromptCard({ template, prompt, compact }: Props) {
  const item = template || prompt
  if (!item) return null

  const isInternal = !!template
  const title = template ? template.name : (prompt?.title || '')
  const category = item.category
  const style = CATEGORY_STYLES[category] || DEFAULT_STYLE
  
  // Normalize cover image
  const coverImage = isInternal ? style.coverImage : (prompt?.coverImage || null)

  // Unified action helper
  const actionLabel = isInternal ? 'Use this prompt' : 'View on SnackPrompt'
  const actionLink = isInternal ? `/discover/${template.id}` : (prompt?.sourceUrl || '')
  const isExternal = !isInternal

  // Unified Link wrapper
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (isExternal) {
      return (
        <a 
          href={actionLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`glass glass-hover flex flex-col group overflow-hidden transition-all duration-300 ${compact ? 'p-3' : 'p-0 h-full'}`}
        >
          {children}
        </a>
      )
    }
    return (
      <Link 
        to={actionLink} 
        className={`glass glass-hover flex flex-col group overflow-hidden transition-all duration-300 ${compact ? 'p-3' : 'p-0 h-full'}`}
      >
        {children}
      </Link>
    )
  }

  if (compact) {
    return (
      <Wrapper>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white/90 shadow-lg"
            style={{ background: style.gradient }}
          >
            {coverImage ? (
              <img src={coverImage} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {style.icon}
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {title}
            </h4>
            <p className="text-[11px] text-gray-500 truncate">{category}</p>
          </div>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {/* Thumbnail Area */}
      <div 
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{ background: style.gradient }}
      >
        {coverImage ? (
          <img src={coverImage} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
        )}
        
        <div className="relative z-10 p-4 transition-transform duration-500 group-hover:scale-110">
          <svg className="w-12 h-12 text-white/90 drop-shadow-2xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {style.icon}
          </svg>
        </div>
        
        {/* Category Badge on Thumbnail */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/90">
          {category}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
            <span>{isInternal ? `${(template as any).qualityScore}/30` : `${(prompt as any).uses} uses`}</span>
            <span className="text-purple-500/50 text-xs">✦</span>
          </div>
          <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1">
            {actionLabel}
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </Wrapper>
  )
}
