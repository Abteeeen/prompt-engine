import React, { useEffect, useState } from 'react'
import type { Template } from '../types'
import { PromptCard } from '../components/PromptCard'
import { discoverPrompts, discoverCategories } from '../data/discoverPrompts'

export function DiscoverPage() {
  const [filter, setFilter] = useState('all')

  const shown = filter === 'all' 
    ? discoverPrompts 
    : discoverPrompts.filter(p => p.categorySlug === filter || p.category === filter)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Area */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Discover</h1>
        <p className="text-gray-400 text-base max-w-2xl">
          Explore a library of high-performance, free prompts curated from SnackPrompt. 
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
        {shown.map(prompt => (
          <a
            key={prompt.id}
            href={prompt.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-hover flex flex-col group overflow-hidden transition-all duration-300 p-0 h-full"
          >
            {/* Thumbnail Area */}
            <div 
              className="relative h-32 flex items-center justify-center overflow-hidden"
              style={{ background: prompt.gradient }}
            >
               {prompt.coverImage ? (
                <img src={prompt.coverImage} alt={prompt.title} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
              )}
              
              <div className="relative z-10 p-4 transition-transform duration-500 group-hover:scale-110">
                {/* Emoji removed per user request */}
              </div>
              
              {/* Category Badge on Thumbnail */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/20 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/90">
                {prompt.category}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors line-clamp-1">
                {prompt.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                {prompt.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-400">
                  {prompt.uses} uses <span className="text-purple-500/50">✦</span>
                </span>
                <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  View on SnackPrompt
                  <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </div>
          </a>
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
