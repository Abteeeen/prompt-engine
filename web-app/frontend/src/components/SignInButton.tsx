import React, { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'

interface Props {
  onSuccess?: () => void
  size?: 'small' | 'medium' | 'large'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  width?: number
  className?: string
}

/**
 * Google sign-in button. Exchanges the Google ID token for a session via the auth context.
 * Status text is rendered inline underneath the button (no alerts).
 */
export function SignInButton({ onSuccess, size = 'medium', text = 'signin_with', width, className = '' }: Props) {
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSuccess = async (res: CredentialResponse) => {
    if (!res.credential) {
      setError('Google did not return a credential. Please try again.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await signIn(res.credential)
      onSuccess?.()
    } catch (err) {
      setError(errorMessage(err, 'Sign-in failed. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      <div className={busy ? 'opacity-60 pointer-events-none' : ''}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Google sign-in was cancelled or failed.')}
          theme="filled_black"
          shape="pill"
          size={size}
          text={text}
          width={width}
          useOneTap={false}
        />
      </div>
      {busy && <span className="text-[11px] text-white/50">Signing you in…</span>}
      {error && <span className="text-[11px] text-red-400 text-center max-w-[260px]">{error}</span>}
    </div>
  )
}
