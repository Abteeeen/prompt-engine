import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Template } from '../types'
import { PromptCard } from '../components/PromptCard'
import { discoverPrompts, discoverCategories } from '../data/discoverPrompts'

export function DiscoverPage() {
  const [filter, setFilter] = useState('all')
  const [internalTemplates, setInternalTemplates] = useState<Template[]>([])

  useEffect(() => {
    api.templates.list()
      .then(list => setInternalTemplates(list.slice(0, 10)))
      .catch(() => {})
  }, [])

  // Merge datasets
  const allPrompts = [
    ...internalTemplates.map(t => ({ ...t, isInternal: true })),
    ...discoverPrompts.map(p => ({ ...p, isInternal: false }))
  ]

  const shown = filter === 'all' 
    ? allPrompts 
    : allPrompts.filter(p => {
        const cat = p.category.toLowerCase()
        const f = filter.toLowerCase()
        
        // Basic mapping for better filtering
        if (f === 'marketing' && (cat === 'sales' || cat === 'communication')) return true
        if (f === 'business' && (cat === 'legal' || cat === 'productivity' || cat === 'hr' || cat === 'product')) return true
        if (f === 'writing' && (cat === 'content' || cat === 'creativity' || cat === 'education')) return true
        if (f === 'research' || f === 'seo & research') {
           if (cat === 'research' || cat === 'analytics') return true
        }
        if (f === 'art' && cat === 'multimedia') return true
        if (f === 'development' && cat === 'support') return true

        return cat === f || (p as any).categorySlug === f
      })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Area */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Discover</h1>
        <p className="text-gray-400 text-base max-w-2xl">
          Explore our professional Pro Collection combined with high-performance community prompts. 
          Pick a category to find the perfect starting point for your next idea.
        </p>
      </div>

      {/* Filter tabs - Horizontal Scrollable on Mobile */}
      <div className="relative mb-10 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 scroll-smooth">
          {discoverCategories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setFilter(cat.slug)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                filter === cat.slug 
                  ? 'bg-white text-black shadow-xl shadow-white/10' 
                  : 'text-gray-400 hover:text-white glass hover:bg-white/8'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Subtle fade on edges for overflow */}
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#050510] to-transparent pointer-events-none sm:hidden" />
      </div>

      {/* Grid - 2 cols mobile, 3-4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in text-white">
        {shown.map((p, i) => (
          <div key={(p as any).id + i}>
            <PromptCard 
              template={(p as any).isInternal ? (p as Template) : undefined} 
              prompt={!(p as any).isInternal ? (p as any) : undefined} 
            />
          </div>
        ))}
        {shown.length === 0 && (
          <div className="col-span-full text-center py-32">
            <div className="text-4xl mb-4 opacity-20">📂</div>
            <p className="text-gray-500 font-medium">No prompts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
