import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { api, errorMessage } from '../services/api'
import type { Template } from '../types'
import { PromptCard } from '../components/PromptCard'
import { usePageTitle } from '../hooks/usePageTitle'

export default function TemplatesPage() {
  usePageTitle('Templates')
  const [filter, setFilter] = useState('all')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.templates
      .list()
      .then(setTemplates)
      .catch(err => setError(errorMessage(err, 'Could not load templates.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    api.analytics.track('page_view', undefined, { page: 'templates' })
  }, [load])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    templates.forEach(t => counts.set(t.category, (counts.get(t.category) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => name)
  }, [templates])

  const shown = filter === 'all' ? templates : templates.filter(t => t.category === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Templates</h1>
        <p className="text-gray-400 text-base max-w-2xl">
          {templates.length ? `${templates.length} expert templates` : 'Expert templates'} for the work people actually do with AI.
          Pick one, fill in a short form, and get a scored prompt in under a minute.
        </p>
      </div>

      {/* Category filter */}
      {!loading && !error && templates.length > 0 && (
        <div className="relative mb-10 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {['all', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  filter === cat ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-gray-400 hover:text-white glass hover:bg-white/8'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 skeleton" />)}
        </div>
      )}

      {!loading && error && (
        <div className="glass p-8 rounded-2xl text-center max-w-md mx-auto" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button onClick={load} className="h-9 px-4 rounded-lg text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] transition-all">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in text-white">
          {shown.map(t => <PromptCard key={t.id} template={t} />)}
          {shown.length === 0 && (
            <div className="col-span-full text-center py-32">
              <p className="text-gray-500 font-medium">No templates in this category yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
