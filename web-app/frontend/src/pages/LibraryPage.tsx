import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../services/api'
import type { LibraryPromptSummary } from '../types'
import { RequireAuth } from '../components/RequireAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatRelative } from '../utils/time'
import { SearchIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon } from '../components/ui/Icons'

function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-500'
  if (score >= 26) return 'text-emerald-400'
  if (score >= 20) return 'text-purple-400'
  if (score >= 15) return 'text-amber-400'
  return 'text-red-400'
}

function LibraryList() {
  const [items, setItems] = useState<LibraryPromptSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favError, setFavError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.library
      .list()
      .then(rows => setItems(rows))
      .catch(err => setError(errorMessage(err, 'Could not load your library.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    api.analytics.track('page_view', undefined, { page: 'library' })
  }, [load])

  const toggleFavorite = async (e: React.MouseEvent, item: LibraryPromptSummary) => {
    e.preventDefault()
    e.stopPropagation()
    setFavError('')
    const previous = item.is_favorite
    setItems(list => list.map(p => (p.id === item.id ? { ...p, is_favorite: !previous } : p)))
    try {
      const res = await api.library.favorite(item.id)
      setItems(list => list.map(p => (p.id === item.id ? { ...p, is_favorite: res.is_favorite } : p)))
    } catch (err) {
      setItems(list => list.map(p => (p.id === item.id ? { ...p, is_favorite: previous } : p)))
      setFavError(errorMessage(err, 'Could not update favorite.'))
    }
  }

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(p => {
      if (favoritesOnly && !p.is_favorite) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        (p.domain ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q))
      )
    })
  }, [items, search, favoritesOnly])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Library</h1>
          <p className="text-sm text-gray-500">
            {items.length ? `${items.length} saved prompt${items.length === 1 ? '' : 's'}. ` : ''}
            Every save keeps a version history, so you can edit freely.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95"
        >
          New prompt
        </Link>
      </div>

      {!loading && !error && items.length > 0 && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, domain or tag"
              className="input-base pl-9"
              aria-label="Search library"
            />
          </div>
          <button
            onClick={() => setFavoritesOnly(f => !f)}
            className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold border transition-all ${
              favoritesOnly ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-white/60 bg-white/[0.04] border-white/[0.1] hover:text-white'
            }`}
          >
            <StarIcon className="w-3.5 h-3.5" filled={favoritesOnly} /> Favorites
          </button>
        </div>
      )}

      {favError && <p className="text-xs text-red-400 mb-4">{favError}</p>}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 skeleton" />)}
        </div>
      )}

      {!loading && error && (
        <div className="glass p-8 rounded-2xl text-center max-w-md mx-auto" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button onClick={load} className="h-9 px-4 rounded-lg text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] transition-all">Try again</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="glass p-10 rounded-2xl text-center max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-white mb-2">Nothing saved yet</h2>
          <p className="text-sm text-gray-500 mb-6">Generate a prompt and press “Save to library” to keep it here with full version history.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/" className="h-9 px-4 inline-flex items-center rounded-lg text-xs font-bold text-white bg-gradient-brand">Generate a prompt</Link>
            <Link to="/templates" className="h-9 px-4 inline-flex items-center rounded-lg text-xs font-semibold text-white/80 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1]">Browse templates</Link>
          </div>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {shown.map(p => (
            <Link key={p.id} to={`/library/${encodeURIComponent(p.id)}`} className="glass glass-hover p-5 flex flex-col group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">{p.title}</h3>
                <button
                  onClick={e => void toggleFavorite(e, p)}
                  className={`shrink-0 w-8 h-8 -mr-2 -mt-1 rounded-lg flex items-center justify-center transition-colors ${p.is_favorite ? 'text-amber-400' : 'text-white/30 hover:text-amber-300'}`}
                  title={p.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={p.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={p.is_favorite}
                >
                  <StarIcon className="w-4 h-4" filled={p.is_favorite} />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                {p.domain && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">{p.domain}</span>}
                {(p.tags ?? []).slice(0, 2).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.05] text-white/50 border border-white/[0.08]">{t}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between text-[11px] text-white/40 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${scoreColor(p.score)}`}>{p.score !== null ? `${p.score}/30` : 'Unscored'}</span>
                  <span>v{p.version_count || 1}</span>
                  {p.rating === 1 && <ThumbsUpIcon className="w-3 h-3 text-emerald-400" />}
                  {p.rating === -1 && <ThumbsDownIcon className="w-3 h-3 text-amber-400" />}
                </div>
                <span>Updated {formatRelative(p.updated_at)}</span>
              </div>
            </Link>
          ))}
          {shown.length === 0 && (
            <div className="col-span-full text-center py-20 text-sm text-gray-500">No prompts match your filter.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LibraryPage() {
  usePageTitle('Library')
  return (
    <RequireAuth title="Your prompt library" description="Sign in with Google to save prompts, edit them with version history, and open them in ChatGPT or Claude with one click.">
      <LibraryList />
    </RequireAuth>
  )
}
