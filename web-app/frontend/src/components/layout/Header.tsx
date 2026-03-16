import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../ThemeToggle'

const NAV = [
  { href: '/', label: 'Home', icon: '✨' },
  { href: '/agents', label: 'Agents', icon: '⚡' },
  { href: '/discover', label: 'Discover', icon: '🚀' },
  { href: '/generate', label: 'Generate', icon: '✨' },
]

export function Header() {
  const { pathname } = useLocation()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true)  // Scrolling up
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>

      {/* Nav Bar - Center/Right, fades on scroll */}
      <header className={`hidden md:flex fixed top-4 left-0 right-0 z-50 justify-center pointer-events-none transition-all duration-500 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div
          className="pointer-events-auto flex items-center gap-4 px-4 py-2.5 rounded-2xl mx-4 md:mx-0 shadow-2xl"
          style={{
            background: 'var(--glass-bg, rgba(19, 19, 26, 0.8))',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          }}
        >
          {/* Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full" style={{ background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))' }}>
            {NAV.map(({ href, label, icon }) => {
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
                  <span className="text-sm">{icon}</span>
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Side: Theme + CTA */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle variant="desktop" />
            </div>
            <Link
              to="/generate"
              className="flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold text-white transition-all transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
              }}
            >
              <span className="hidden sm:inline">Generate</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
