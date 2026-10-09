import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../ThemeToggle'
import { SignInButton } from '../SignInButton'
import { formatUsage, useAuth } from '../../context/AuthContext'
import type { User } from '../../types'
import { BookmarkIcon, GridIcon, HomeIcon, LogOutIcon, SettingsIcon, ZapIcon } from '../ui/Icons'

interface NavItem {
  href: string
  label: string
  icon: (p: { className?: string }) => JSX.Element
  authOnly?: boolean
}

const NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/templates', label: 'Templates', icon: GridIcon },
  { href: '/generate', label: 'Generate', icon: ZapIcon },
  { href: '/library', label: 'Library', icon: BookmarkIcon, authOnly: true },
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

function Avatar({ user, size = 32 }: { user: User; size?: number }) {
  const [broken, setBroken] = useState(false)
  if (user.avatar_url && !broken) {
    return (
      <img
        src={user.avatar_url}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="rounded-full flex items-center justify-center text-[11px] font-bold text-white"
      style={{ width: size, height: size, background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}
    >
      {initials(user.name || user.email)}
    </span>
  )
}

function AccountMenu({ user, align = 'right' }: { user: User; align?: 'left' | 'right' }) {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleSignOut = async () => {
    setBusy(true)
    await signOut()
    setBusy(false)
    setOpen(false)
  }

  const item = 'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/[0.06] transition-colors'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--glass-border,rgba(255,255,255,0.1))] bg-[var(--glass-bg,rgba(255,255,255,0.05))] hover:border-purple-500/40 transition-all"
        aria-haspopup="menu"
        aria-expanded={open}
        title={user.email}
      >
        <Avatar user={user} size={28} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-full mt-2 w-56 p-1.5 rounded-xl animate-scale-in ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{
            background: 'var(--nav-bg, rgba(15,15,25,0.98))',
            border: '1px solid var(--glass-border, rgba(139,92,246,0.25))',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid var(--nav-border, rgba(255,255,255,0.06))' }}>
            <p className="text-sm font-semibold text-[var(--text)] truncate">{user.name}</p>
            <p className="text-[11px] text-[var(--muted)] truncate">{user.email}</p>
          </div>
          <Link to="/library" role="menuitem" className={item}>
            <BookmarkIcon className="w-4 h-4" /> Library
          </Link>
          <Link to="/settings" role="menuitem" className={item}>
            <SettingsIcon className="w-4 h-4" /> Settings
          </Link>
          <button onClick={handleSignOut} disabled={busy} role="menuitem" className={`${item} disabled:opacity-50`}>
            <LogOutIcon className="w-4 h-4" /> {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { pathname } = useLocation()
  const { user, usage, loading } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      setIsVisible(!(current > lastScrollY.current && current > 100))
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const usageText = formatUsage(usage)
  const visibleNav = NAV.filter(n => !n.authOnly || user)
  const visibility = isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'

  return (
    <>
      {/* Desktop: glass pill header */}
      <header className={`hidden md:flex fixed top-4 left-0 right-0 z-50 justify-center pointer-events-none transition-all duration-500 ease-in-out transform ${visibility}`}>
        <div
          className="pointer-events-auto flex items-center gap-4 px-4 py-2.5 rounded-2xl mx-4 shadow-2xl"
          style={{
            background: 'var(--glass-bg, rgba(19, 19, 26, 0.8))',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          }}
        >
          <nav className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))' }}>
            {visibleNav.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-[var(--text)] bg-[var(--glass-border,rgba(124,58,237,0.2))] shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--glass-border)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {usageText && (
              <span className="hidden lg:inline text-xs text-[var(--muted)] whitespace-nowrap" title="Generations used today">
                {usageText}
              </span>
            )}
            <ThemeToggle variant="desktop" />
            <Link
              to="/generate"
              className="hidden lg:flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold text-white transition-all transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
              }}
            >
              <span>Generate</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            {loading ? (
              <span className="w-9 h-9 rounded-full skeleton" />
            ) : user ? (
              <AccountMenu user={user} />
            ) : (
              <SignInButton size="medium" text="signin" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile: compact account control (top right). Navigation lives in the bottom bar. */}
      <div className={`md:hidden fixed top-4 right-4 z-40 flex items-center gap-2 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12 pointer-events-none'}`}>
        {usageText && user && (
          <span className="text-[11px] text-white/50 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1]">{usageText}</span>
        )}
        {loading ? null : user ? <AccountMenu user={user} /> : <SignInButton size="medium" text="signin" />}
      </div>
    </>
  )
}
