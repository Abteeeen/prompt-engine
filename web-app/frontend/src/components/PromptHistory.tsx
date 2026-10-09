import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, errorMessage } from '../services/api'
import type { GenerationRecord } from '../types'
import { ArrowRightIcon, ClockIcon, SearchIcon, Spinner, TrashIcon, XIcon } from './ui/Icons'
import { formatRelative } from '../utils/time'

// ── Types ───────────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string
  userRequest: string
  prompt: string
  qualityScore: number
  domain: string | null
  source: string
  createdAt: string
}

interface PromptHistoryProps {
  onLoad: (item: HistoryItem) => void
}

// ── Local storage (guests) ───────────────────────────────────────────────────

const STORAGE_KEY = 'prompt_engine_history'
const MAX_ITEMS = 50
export const OPEN_HISTORY_EVENT = 'pe:open-history'

/** Opens the history drawer from anywhere (e.g. the mobile nav). */
export function openHistory() {
  window.dispatchEvent(new CustomEvent(OPEN_HISTORY_EVENT))
}

function getLocalHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.map((raw: HistoryItem) => ({ ...raw, id: String(raw.id) }))
  } catch {
    return []
  }
}

function saveLocalHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage errors
  }
}

export function saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>) {
  const history = getLocalHistory()
  const newItem: HistoryItem = { ...item, id: String(Date.now()), createdAt: new Date().toISOString() }
  saveLocalHistory([newItem, ...history].slice(0, MAX_ITEMS))
  return newItem
}

function fromGeneration(g: GenerationRecord): HistoryItem {
  return {
    id: String(g.id),
    userRequest: g.request,
    prompt: g.prompt,
    qualityScore: g.quality_score ?? 0,
    domain: g.domain,
    source: 'ai',
    createdAt: g.created_at,
  }
}

// ── Item card ────────────────────────────────────────────────────────────────

interface HistoryItemCardProps {
  item: HistoryItem
  onLoad: (item: HistoryItem) => void
  onDelete?: (id: string) => void
}

function HistoryItemCard({ item, onLoad, onDelete }: HistoryItemCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    if (!onDelete) return
    if (showConfirm) onDelete(item.id)
    else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 2000)
    }
  }

  const preview = item.userRequest.slice(0, 60) + (item.userRequest.length > 60 ? '…' : '')

  return (
    <div className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-200">
      <p className="text-sm text-white/90 mb-3 leading-relaxed">{preview}</p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <span>★</span>
          {item.qualityScore}/30
        </span>
        {item.domain && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">{item.domain}</span>
        )}
        <span className="text-[11px] text-white/40 ml-auto">{formatRelative(item.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onLoad(item)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/80 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] transition-all active:scale-95"
        >
          <ArrowRightIcon className="w-3.5 h-3.5" />
          Load
        </button>
        {onDelete && (
          <button
            onClick={handleDelete}
            className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all active:scale-95 ${
              showConfirm
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
            }`}
            title={showConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PromptHistory({ onLoad }: PromptHistoryProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  const isServer = !!user

  const load = useCallback(async () => {
    if (!user) {
      setHistory(getLocalHistory())
      setError('')
      return
    }
    setLoading(true)
    setError('')
    try {
      const rows = await api.generations.list(50)
      setHistory(rows.map(fromGeneration))
    } catch (err) {
      setError(errorMessage(err, 'Could not load your history.'))
    } finally {
      setLoading(false)
    }
  }, [user])

  // Hide the trigger when scrolling down.
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      setIsVisible(!(current > lastScrollY.current && current > 50))
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load on mount / sign-in change, and refresh each time the drawer opens.
  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (isOpen) void load()
  }, [isOpen, load])

  // Sync local history across tabs (guests).
  useEffect(() => {
    if (isServer) return
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setHistory(getLocalHistory())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [isServer])

  // Allow other components (mobile nav) to open the drawer.
  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener(OPEN_HISTORY_EVENT, handler)
    return () => window.removeEventListener(OPEN_HISTORY_EVENT, handler)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    saveLocalHistory(updated)
  }

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 2500)
      return
    }
    setHistory([])
    saveLocalHistory([])
    setConfirmClear(false)
  }

  const handleLoad = (item: HistoryItem) => {
    onLoad(item)
    setIsOpen(false)
  }

  const q = searchQuery.trim().toLowerCase()
  const filteredHistory = q
    ? history.filter(
        item =>
          item.userRequest.toLowerCase().includes(q) ||
          item.prompt.toLowerCase().includes(q) ||
          (item.domain && item.domain.toLowerCase().includes(q)),
      )
    : history

  const historyCount = history.length

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed left-4 top-4 z-40 flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-purple-500/30 backdrop-blur-sm shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105 active:scale-95 group ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12 pointer-events-none'
        }`}
        title="Prompt history"
        aria-label="Open prompt history"
      >
        <ClockIcon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        {historyCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold bg-purple-500 text-white border border-black/30">
            {historyCount > 99 ? '99+' : historyCount}
          </span>
        )}
      </button>

      {isOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsOpen(false)} />}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 w-full sm:w-[320px] transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(10, 10, 20, 0.97)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.4)' : 'none',
        }}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Prompt history</h2>
            {historyCount > 0 && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/20 text-purple-300">{historyCount}</span>}
          </div>
          <div className="flex items-center gap-1">
            {!isServer && historyCount > 0 && (
              <button onClick={handleClearAll} className={`h-7 px-2 rounded-lg text-[11px] font-medium transition-colors ${confirmClear ? 'bg-red-500/20 text-red-300' : 'text-red-400 hover:bg-red-500/10'}`}>
                {confirmClear ? 'Confirm clear' : 'Clear all'}
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="flex items-center justify-center w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors" aria-label="Close history">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 pb-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full h-9 pl-9 pr-3 rounded-lg text-sm bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/40 transition-colors"
            />
          </div>
          <p className="text-[10px] text-white/30 mt-2">
            {isServer ? 'Synced to your account across devices.' : 'Stored in this browser only. Sign in to keep history across devices.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-white/50 text-xs">
              <Spinner className="w-4 h-4" /> Loading history…
            </div>
          )}
          {!loading && error && (
            <div className="p-3 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}{' '}
              <button onClick={() => void load()} className="underline hover:text-red-300">Retry</button>
            </div>
          )}
          {!loading && !error && filteredHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClockIcon className="w-12 h-12 text-white/10 mb-4" strokeWidth={1.5} />
              <p className="text-sm font-medium text-white/50 mb-1">{searchQuery ? 'No matches found' : 'No prompts yet'}</p>
              <p className="text-xs text-white/30 max-w-[200px]">{searchQuery ? 'Try a different search term' : 'Your generated prompts will appear here'}</p>
            </div>
          )}
          {!loading && !error && filteredHistory.map(item => (
            <HistoryItemCard key={item.id} item={item} onLoad={handleLoad} onDelete={isServer ? undefined : handleDelete} />
          ))}
        </div>
      </div>
    </>
  )
}
