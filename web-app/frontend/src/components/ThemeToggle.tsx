import React, { useEffect, useState } from 'react'

type Theme = 'default' | 'dark' | 'light'

export function ThemeToggle({ variant = 'desktop' }: { variant?: 'mobile' | 'desktop' }) {
  const [theme, setTheme] = useState<Theme>('default')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('app_theme') as Theme | null;
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else {
      document.documentElement.setAttribute('data-theme', 'default')
    }
  }, [])

  const toggleTheme = () => {
    // Cycle: default -> dark -> light -> default
    const newTheme: Theme = theme === 'default' ? 'dark' : theme === 'dark' ? 'light' : 'default'
    
    // Trigger Dr. Strange animation when going back to Default
    if (newTheme === 'default') {
      setIsTransitioning(true)
      document.body.classList.add('theme-transition-active')
      setTimeout(() => {
        setIsTransitioning(false)
        document.body.classList.remove('theme-transition-active')
      }, 1200) // Match the 1.2s CSS animation
    }

    setTheme(newTheme)
    localStorage.setItem('app_theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const isMobile = variant === 'mobile'

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`relative flex items-center justify-center rounded-full transition-all focus:outline-none ${
        isMobile 
          ? 'w-8 h-8 text-white/50 hover:text-white/80' 
          : 'w-9 h-9 border border-[var(--glass-border,rgba(255,255,255,0.1))] bg-[var(--glass-bg,rgba(255,255,255,0.05))] text-[var(--muted)] hover:text-[var(--text)] overflow-hidden shadow-sm'
      }`}
      title={`Current: ${theme} - Click to switch`}
    >
      {theme === 'default' ? (
        // Thunder (Default mode)
        <svg className={isMobile ? "w-5 h-5" : "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ) : theme === 'dark' ? (
        // Moon (Dark mode)
        <svg className={isMobile ? "w-5 h-5" : "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ) : (
        // Sun (Light mode)
        <svg className={isMobile ? "w-5 h-5" : "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      )}
    </button>
  )
}
