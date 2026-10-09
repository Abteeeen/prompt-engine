import React from 'react'
import { useAuth } from '../context/AuthContext'
import { SignInButton } from './SignInButton'
import { BookmarkIcon } from './ui/Icons'

interface Props {
  title?: string
  description?: string
  children: React.ReactNode
}

/**
 * Renders children for signed-in users, a sign-in card for guests,
 * and a skeleton while the initial session check runs.
 */
export function RequireAuth({ title = 'Sign in to continue', description, children }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-4" aria-busy="true">
        <div className="h-8 w-40 skeleton" />
        <div className="h-4 w-72 max-w-full skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 skeleton" />)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="glass p-8 sm:p-10 rounded-2xl max-w-md mx-auto text-center" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="w-12 h-12 mx-auto mb-5 rounded-xl flex items-center justify-center text-purple-300" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <BookmarkIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">{title}</h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {description || 'Sign in with Google to save prompts, keep your history across devices, and get a higher daily limit.'}
          </p>
          <SignInButton size="large" text="continue_with" />
          <p className="text-[11px] text-gray-600 mt-5">We only use your Google account to identify you. See our Privacy policy.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
