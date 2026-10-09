import React from 'react'
import { Link } from 'react-router-dom'
import { COMPANY_NAME } from '../../config'
import { openFeedback } from '../FeedbackWidget'

const LINKS = [
  { to: '/templates', label: 'Templates' },
  { to: '/generate', label: 'Generate' },
  { to: '/library', label: 'Library' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-10 mt-16 md:mt-24" style={{ borderTop: '1px solid var(--glass-border, rgba(255,255,255,0.08))' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="logo-text gradient-text">{COMPANY_NAME}</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Type what you need. Get a complete, scored prompt.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              {l.label}
            </Link>
          ))}
          <button type="button" onClick={openFeedback} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Feedback
          </button>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-medium">© {year} {COMPANY_NAME}</p>
      </div>
    </footer>
  )
}
