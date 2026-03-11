import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Template } from '../types'
import { TemplateCard } from '../components/TemplateCard'

const ALL_CATEGORIES = ['All', 'Development', 'Analytics', 'Content', 'Support', 'Communication', 'Marketing', 'Research', 'Education', 'Product', 'Creativity', 'Sales', 'Multimedia', 'Legal', 'Business', 'Productivity', 'Design', 'HR']

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.templates.list().then(t => { setTemplates(t); setLoading(false) }).catch(() => setLoading(false))
    api.analytics.track('page_view', undefined, { page: 'templates' })
  }, [])

  const shown = filter === 'All' ? templates : templates.filter(t => t.category === filter)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Templates</h1>
        <p className="text-gray-400 text-sm">10 science-backed domain templates. Pick one, fill the form, get a perfect prompt.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-8">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filter === cat ? 'bg-gradient-brand text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white glass hover:bg-white/7'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass h-44 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {shown.map(t => <TemplateCard key={t.id} template={t} />)}
          {shown.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">No templates in this category.</div>
          )}
        </div>
      )}
    </div>
  )
}
