import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, getToken, setToken, isUnauthorized } from '../services/api'
import type { Usage, User } from '../types'

export interface AuthContextValue {
  user: User | null
  usage: Usage | null
  /** true while the initial session check is running */
  loading: boolean
  /** Exchange a Google ID token for a session. Throws on failure. */
  signIn: (credential: string) => Promise<User>
  signOut: () => Promise<void>
  /** Re-fetch user + usage (or just usage for guests). */
  refresh: () => Promise<void>
  /** Apply a usage object returned alongside another response (e.g. generate). */
  applyUsage: (usage: Usage | undefined | null) => void
  /** Drop the local session without calling the server (used after account deletion). */
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const loadGuestUsage = useCallback(async () => {
    try {
      const u = await api.usage.get()
      if (mounted.current) setUsage(u)
    } catch {
      // Usage is informational; keep whatever we had.
    }
  }, [])

  const refresh = useCallback(async () => {
    const token = getToken()
    if (!token) {
      if (mounted.current) setUser(null)
      await loadGuestUsage()
      return
    }
    try {
      const me = await api.auth.me()
      if (!mounted.current) return
      setUser(me.user)
      setUsage(me.usage)
    } catch (err) {
      if (isUnauthorized(err)) {
        setToken(null)
        if (mounted.current) setUser(null)
        await loadGuestUsage()
      }
      // Network or server errors: keep the token and retry next time.
    }
  }, [loadGuestUsage])

  useEffect(() => {
    let cancelled = false
    refresh().finally(() => {
      if (!cancelled && mounted.current) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refresh])

  const signIn = useCallback(
    async (credential: string) => {
      const res = await api.auth.google(credential)
      setToken(res.token)
      if (mounted.current) setUser(res.user)
      // Pull usage for the signed-in account.
      try {
        const me = await api.auth.me()
        if (mounted.current) {
          setUser(me.user)
          setUsage(me.usage)
        }
      } catch {
        // The token is valid (we just got it); usage will refresh on the next call.
      }
      return res.user
    },
    [],
  )

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    setUsage(null)
    void loadGuestUsage()
  }, [loadGuestUsage])

  const signOut = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch {
      // Even if the server call fails, drop the local session.
    }
    clearSession()
  }, [clearSession])

  const applyUsage = useCallback((next: Usage | undefined | null) => {
    if (next) setUsage(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, usage, loading, signIn, signOut, refresh, applyUsage, clearSession }),
    [user, usage, loading, signIn, signOut, refresh, applyUsage, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Human-friendly usage summary, e.g. "4 of 15 today" or "Unlimited". */
export function formatUsage(usage: Usage | null): string | null {
  if (!usage) return null
  if (usage.limit === null) return 'Unlimited'
  return `${usage.used} of ${usage.limit} today`
}
