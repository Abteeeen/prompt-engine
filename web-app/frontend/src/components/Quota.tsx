import React from 'react'
import { useAuth } from '../context/AuthContext'
import { SignInButton } from './SignInButton'
import { AlertIcon } from './ui/Icons'

/** Small pill showing remaining daily generations, read from the auth context. */
export function QuotaBadge({ className = '' }: { className?: string }) {
  const { usage } = useAuth()
  if (!usage) return null

  const label =
    usage.limit === null || usage.remaining === null
      ? 'Quota: Unlimited'
      : `Tries left: ${Math.max(0, usage.remaining)}`

  const low = usage.remaining !== null && usage.remaining <= 2

  return (
    <div
      className={`px-3 py-1 rounded-full flex items-center gap-2 ${className}`}
      style={{
        background: low ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)',
        border: `1px solid ${low ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)'}`,
      }}
      title={usage.plan === 'guest' ? 'Sign in for a higher daily limit' : `Plan: ${usage.plan}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${low ? 'bg-amber-400' : 'bg-purple-400'}`} />
      <span className={`text-[11px] font-bold ${low ? 'text-amber-300' : 'text-purple-300'}`}>{label}</span>
    </div>
  )
}

function formatResetTime(iso: string | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

interface QuotaNoticeProps {
  message: string
  /** Called after a guest signs in from the notice (e.g. to retry the request). */
  onSignedIn?: () => void
}

/** Shown when a request returned 429 with code QUOTA_EXCEEDED. */
export function QuotaNotice({ message, onSignedIn }: QuotaNoticeProps) {
  const { user, usage } = useAuth()
  const reset = formatResetTime(usage?.resetsAt)

  return (
    <div className="mt-5 p-5 rounded-xl flex flex-col items-center text-center animate-fade-in" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
      <div className="flex items-center gap-2 mb-2 text-amber-300">
        <AlertIcon className="w-4 h-4" />
        <p className="text-sm font-semibold">{message || 'You have reached your daily limit.'}</p>
      </div>
      {!user ? (
        <>
          <p className="text-xs text-white/50 mb-4 max-w-sm">
            Sign in with Google to get a higher daily limit, keep your history, and save prompts to your library.
          </p>
          <SignInButton onSuccess={onSignedIn} text="continue_with" />
        </>
      ) : (
        <p className="text-xs text-white/50 max-w-sm">
          {reset ? `Your limit resets at ${reset}.` : 'Your limit resets daily.'}
        </p>
      )}
    </div>
  )
}
