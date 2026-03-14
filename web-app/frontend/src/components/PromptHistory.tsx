import React, { useEffect, useState, useCallback } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: number
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

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'prompt_engine_history'
const MAX_ITEMS = 50

// ── Helper Functions ────────────────────────────────────────────────────────

function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage errors
  }
}

export function saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>) {
  const history = getHistory()
  const newItem: HistoryItem = {
    ...item,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }
  const updated = [newItem, ...history].slice(0, MAX_ITEMS)
  saveHistory(updated)
  return newItem
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

// ── Components ──────────────────────────────────────────────────────────────

function HistoryIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function TrashIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

// ── History Item Component ───────────────────────────────────────────────────

interface HistoryItemCardProps {
  item: HistoryItem
  onLoad: (item: HistoryItem) => void
  onDelete: (id: number) => void
}

function HistoryItemCard({ item, onLoad, onDelete }: HistoryItemCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(item.id)
    } else {
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">
            {item.domain}
          </span>
        )}
        <span className="text-[11px] text-white/40 ml-auto">
          {formatTimeAgo(item.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onLoad(item)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/80 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/[0.2] transition-all active:scale-95"
        >
          <ArrowRightIcon className="w-3.5 h-3.5" />
          Load
        </button>
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
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function PromptHistory({ onLoad }: PromptHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const loadHistory = useCallback(() => {
    setHistory(getHistory())
  }, [])

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    loadHistory()
    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadHistory()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [loadHistory])

  // Hide the logo and other fixed floating elements globally when history modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('history-open')
    } else {
      document.body.classList.remove('history-open')
    }
    return () => document.body.classList.remove('history-open')
  }, [isOpen])

  const handleDelete = (id: number) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    saveHistory(updated)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([])
      saveHistory([])
    }
  }

  const handleLoad = (item: HistoryItem) => {
    onLoad(item)
    setIsOpen(false)
  }

  const filteredHistory = searchQuery.trim()
    ? history.filter(item =>
        item.userRequest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.domain && item.domain.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : history

  const historyCount = history.length

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed left-4 top-4 z-40 flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-purple-500/30 backdrop-blur-sm shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105 active:scale-95 group ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12 pointer-events-none'
        }`}
        title="Prompt History"
      >
        <HistoryIcon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        {historyCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold bg-purple-500 text-white border border-black/30">
            {historyCount > 99 ? '99+' : historyCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 w-full sm:w-[320px] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(10, 10, 20, 0.97)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.4)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Prompt History</h2>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/20 text-purple-300">
                {historyCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {historyCount > 0 && (
              <button
                onClick={handleClearAll}
                className="h-7 px-2 rounded-lg text-[11px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3" style={{ maxHeight: 'calc(100% - 130px)' }}>
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClockIcon className="w-12 h-12 text-white/10 mb-4" />
              <p className="text-sm font-medium text-white/50 mb-1">
                {searchQuery ? 'No matches found' : 'No prompts yet'}
              </p>
              <p className="text-xs text-white/30 max-w-[200px]">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Your generated prompts will appear here'}
              </p>
            </div>
          ) : (
            filteredHistory.map(item => (
              <HistoryItemCard
                key={item.id}
                item={item}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
