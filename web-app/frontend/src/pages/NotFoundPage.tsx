import React from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">404</p>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
        <span className="text-white">Nothing here.</span>
        <br />
        <span className="gradient-text">Wrong prompt.</span>
      </h1>
      <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto mb-10">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link to="/" className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95">
          Go home
        </Link>
        <Link to="/templates" className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white/80 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-all">
          Browse templates
        </Link>
      </div>
    </div>
  )
}
