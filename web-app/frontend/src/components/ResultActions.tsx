import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, errorMessage } from '../services/api'
import { SignInButton } from './SignInButton'
import { BookmarkIcon, CheckIcon, CopyIcon, ExternalLinkIcon, Spinner } from './ui/Icons'

export function chatGptUrl(prompt: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}

export function claudeUrl(prompt: string): string {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
}

export function deriveTitle(source: string, fallback = 'Untitled prompt'): string {
  const firstLine = source.split('\n').map(l => l.trim()).find(Boolean) || fallback
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}…` : firstLine
}

interface Props {
  prompt: string
  /** Title used when saving to the library. Defaults to the first line of the prompt. */
  title?: string
  domain?: string | null
  score?: number | null
  generationId?: string
  onCopy?: () => void
  /** Hide the save button (e.g. inside the library itself). */
  hideSave?: boolean
  className?: string
}

const BTN = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
const BTN_NEUTRAL = `${BTN} text-white/80 bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.1] hover:border-white/[0.2]`
const BTN_ACCENT = `${BTN} text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20`

/**
 * Copy / Save to library / Open in ChatGPT / Open in Claude.
 * Shared by the home generator, the template generator and the library.
 */
export function ResultActions({ prompt, title, domain, score, generationId, onCopy, hideSave, className = '' }: Props) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')
  const [showSignIn, setShowSignIn] = useState(false)

  // A different prompt body can be saved again.
  useEffect(() => {
    setSavedId(null)
    setSaveError('')
  }, [prompt])

  const copy = async () => {
    setCopyFailed(false)
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopyFailed(true)
      setTimeout(() => setCopyFailed(false), 2500)
    }
  }

  const save = async () => {
    if (!user) {
      setShowSignIn(true)
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const created = await api.library.create({
        title: title || deriveTitle(prompt),
        body: prompt,
        domain: domain ?? undefined,
        score: score ?? undefined,
        generationId,
      })
      setSavedId(created.id)
      setShowSignIn(false)
      api.analytics.track('prompt_saved', undefined, { domain: domain ?? null, score: score ?? null })
    } catch (err) {
      setSaveError(errorMessage(err, 'Could not save. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const disabled = !prompt.trim()

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={copy} disabled={disabled} className={BTN_NEUTRAL}>
          {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
          <span className={copied ? 'text-emerald-400' : ''}>{copied ? 'Copied' : copyFailed ? 'Copy failed' : 'Copy'}</span>
        </button>

        {!hideSave && (
          savedId ? (
            <Link to={`/library/${savedId}`} className={`${BTN} text-emerald-300 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20`}>
              <CheckIcon className="w-3.5 h-3.5" />
              Saved · open in Library
            </Link>
          ) : (
            <button onClick={save} disabled={disabled || saving} className={BTN_ACCENT}>
              {saving ? <Spinner className="w-3.5 h-3.5" /> : <BookmarkIcon className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save to library'}
            </button>
          )
        )}

        <a
          href={disabled ? undefined : chatGptUrl(prompt)}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={disabled}
          className={`${BTN_NEUTRAL} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
          onClick={() => api.analytics.track('prompt_opened', undefined, { target: 'chatgpt' })}
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
          Open in ChatGPT
        </a>
        <a
          href={disabled ? undefined : claudeUrl(prompt)}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={disabled}
          className={`${BTN_NEUTRAL} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
          onClick={() => api.analytics.track('prompt_opened', undefined, { target: 'claude' })}
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
          Open in Claude
        </a>
      </div>

      {saveError && <p className="mt-2 text-xs text-red-400">{saveError}</p>}

      {showSignIn && !user && (
        <div className="mt-3 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p className="text-xs text-white/60 flex-1">Sign in with Google to save prompts to your library and keep your history across devices.</p>
          <SignInButton size="medium" text="continue_with" onSuccess={() => void save()} />
        </div>
      )}
    </div>
  )
}
