import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, errorMessage } from '../services/api'
import type { LibraryPrompt, PromptRating, PromptVersion } from '../types'
import { RequireAuth } from '../components/RequireAuth'
import { ResultActions } from '../components/ResultActions'
import { usePageTitle } from '../hooks/usePageTitle'
import { ArrowLeftIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon, TrashIcon, Spinner, CheckIcon } from '../components/ui/Icons'
import { formatRelative } from '../utils/time'

const BTN = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none'

function LibraryDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState<LibraryPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [viewingVersion, setViewingVersion] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [saveError, setSaveError] = useState('')
  const [actionError, setActionError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [favBusy, setFavBusy] = useState(false)

  usePageTitle(prompt?.title ?? 'Library')

  const applyPrompt = useCallback((p: LibraryPrompt) => {
    setPrompt(p)
    setTitle(p.title)
    setBody(p.body)
    setViewingVersion(null)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.library
      .get(id)
      .then(applyPrompt)
      .catch(err => setError(errorMessage(err, 'Could not load this prompt.')))
      .finally(() => setLoading(false))
  }, [id, applyPrompt])

  useEffect(() => {
    load()
  }, [load])

  const dirty = !!prompt && (title.trim() !== prompt.title || body !== prompt.body)
  const versions: PromptVersion[] = prompt ? [...prompt.versions].sort((a, b) => b.version_no - a.version_no) : []

  const save = async () => {
    if (!prompt || !dirty) return
    setSaving(true)
    setSaveError('')
    setSaveStatus('')
    try {
      const input: { title?: string; body?: string } = {}
      if (title.trim() !== prompt.title) input.title = title.trim() || prompt.title
      if (body !== prompt.body) input.body = body
      const updated = await api.library.update(prompt.id, input)
      applyPrompt(updated)
      const latest = updated.versions.reduce((m, v) => Math.max(m, v.version_no), 0)
      setSaveStatus(input.body !== undefined ? `Saved as version ${latest || updated.versions.length}` : 'Title saved')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (err) {
      setSaveError(errorMessage(err, 'Could not save changes.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!prompt) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 4000)
      return
    }
    setDeleting(true)
    setActionError('')
    try {
      await api.library.remove(prompt.id)
      navigate('/library', { replace: true })
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete this prompt.'))
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const toggleFavorite = async () => {
    if (!prompt) return
    setFavBusy(true)
    setActionError('')
    try {
      const res = await api.library.favorite(prompt.id)
      setPrompt({ ...prompt, is_favorite: res.is_favorite })
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update favorite.'))
    } finally {
      setFavBusy(false)
    }
  }

  const rate = async (value: 1 | -1) => {
    if (!prompt) return
    const next: PromptRating = prompt.rating === value ? 0 : value
    setRatingBusy(true)
    setActionError('')
    try {
      await api.library.rate(prompt.id, next)
      setPrompt({ ...prompt, rating: next })
    } catch (err) {
      setActionError(errorMessage(err, 'Could not save your rating.'))
    } finally {
      setRatingBusy(false)
    }
  }

  const viewVersion = (v: PromptVersion) => {
    setBody(v.body)
    setViewingVersion(v.id)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        <div className="h-6 w-32 skeleton" />
        <div className="h-10 w-96 max-w-full skeleton" />
        <div className="h-80 skeleton" />
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-gray-400 mb-4">{error || 'Prompt not found'}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={load} className="text-sm text-purple-400 hover:text-purple-300">Try again</button>
          <Link to="/library" className="text-sm text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5">
            <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Library
          </Link>
        </div>
      </div>
    )
  }

  const latestVersionId = versions[0]?.id ?? null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/library" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors mb-8">
        <ArrowLeftIcon className="w-3 h-3" strokeWidth={2.5} /> Back to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Editor */}
        <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="px-5 py-4 flex items-start justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,92,246,0.06)' }}>
            <div className="flex-1 min-w-[200px]">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent text-lg font-black text-white focus:outline-none placeholder:text-white/30"
                placeholder="Untitled prompt"
                aria-label="Prompt title"
              />
              <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px] text-white/40">
                {prompt.domain && <span className="px-2 py-0.5 rounded-full font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">{prompt.domain}</span>}
                {prompt.score !== null && <span className="font-bold text-emerald-400">{prompt.score}/30</span>}
                <span>Updated {formatRelative(prompt.updated_at)}</span>
                <span>· {versions.length} version{versions.length === 1 ? '' : 's'}</span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              disabled={favBusy}
              className={`${BTN} ${prompt.is_favorite ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-white/60 bg-white/[0.04] border-white/[0.1] hover:text-amber-300'}`}
              aria-pressed={prompt.is_favorite}
            >
              <StarIcon className="w-3.5 h-3.5" filled={prompt.is_favorite} />
              {prompt.is_favorite ? 'Favorite' : 'Add to favorites'}
            </button>
          </div>

          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <ResultActions prompt={body} hideSave onCopy={() => api.analytics.track('library_prompt_copied', undefined, { id: prompt.id })} />
          </div>

          {viewingVersion && viewingVersion !== latestVersionId && (
            <div className="px-5 py-2 text-[11px] text-amber-300 flex items-center justify-between gap-3 flex-wrap" style={{ background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
              <span>Viewing an older version. Save changes to make it the current version.</span>
              <button onClick={() => { setBody(prompt.body); setViewingVersion(null) }} className="underline hover:text-amber-200">Back to current</button>
            </div>
          )}

          <textarea
            value={body}
            onChange={e => {
              setBody(e.target.value)
              setViewingVersion(null)
            }}
            className="w-full bg-transparent px-5 py-5 text-sm text-white/90 font-mono leading-relaxed focus:outline-none resize-y"
            style={{ minHeight: '360px' }}
            spellCheck={false}
            aria-label="Prompt body"
          />

          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {saving ? <Spinner className="w-3.5 h-3.5" /> : <CheckIcon className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {saveStatus && <span className="text-xs text-emerald-400">{saveStatus}</span>}
              {saveError && <span className="text-xs text-red-400">{saveError}</span>}
              {!saveStatus && !saveError && dirty && <span className="text-xs text-white/40">Unsaved changes. Saving the body creates a new version.</span>}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-white/40 hidden sm:inline">Was it helpful?</span>
              <button
                onClick={() => void rate(1)}
                disabled={ratingBusy}
                className={`${BTN} ${prompt.rating === 1 ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-white/60 bg-white/[0.04] border-white/[0.1] hover:text-white'}`}
                aria-pressed={prompt.rating === 1}
              >
                <ThumbsUpIcon className="w-3.5 h-3.5" /> Helpful
              </button>
              <button
                onClick={() => void rate(-1)}
                disabled={ratingBusy}
                className={`${BTN} ${prompt.rating === -1 ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-white/60 bg-white/[0.04] border-white/[0.1] hover:text-white'}`}
                aria-pressed={prompt.rating === -1}
              >
                <ThumbsDownIcon className="w-3.5 h-3.5" /> Not helpful
              </button>
              <button
                onClick={remove}
                disabled={deleting}
                className={`${BTN} ${confirmDelete ? 'text-red-300 bg-red-500/20 border-red-500/40' : 'text-white/50 bg-white/[0.04] border-white/[0.1] hover:text-red-300 hover:border-red-500/30'}`}
              >
                {deleting ? <Spinner className="w-3.5 h-3.5" /> : <TrashIcon className="w-3.5 h-3.5" />}
                {confirmDelete ? 'Click again to delete' : 'Delete'}
              </button>
            </div>
          </div>
          {actionError && <p className="px-5 pb-4 text-xs text-red-400">{actionError}</p>}
        </div>

        {/* Versions */}
        <aside className="glass p-4 rounded-2xl h-fit lg:sticky lg:top-24">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Versions</h2>
          {versions.length === 0 && <p className="text-xs text-gray-500">No versions recorded yet.</p>}
          <ul className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {versions.map(v => {
              const active = viewingVersion ? viewingVersion === v.id : v.id === latestVersionId
              return (
                <li key={v.id}>
                  <button
                    onClick={() => viewVersion(v)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      active ? 'bg-purple-500/10 border-purple-500/40' : 'bg-white/[0.03] border-white/[0.06] hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white">Version {v.version_no}{v.id === latestVersionId ? ' · current' : ''}</span>
                      {v.score !== null && <span className="text-[11px] font-bold text-emerald-400">{v.score}/30</span>}
                    </div>
                    <p className="text-[11px] text-white/40">{formatRelative(v.created_at)}</p>
                    <p className="text-[11px] text-white/50 mt-1.5 line-clamp-2 font-mono">{v.body}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <RequireAuth title="Your prompt library">
      {id ? <LibraryDetail id={id} /> : <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-400">Prompt not found.</div>}
    </RequireAuth>
  )
}
