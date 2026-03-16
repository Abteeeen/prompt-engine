import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { DiscoverDetailPage } from './pages/DiscoverDetailPage'
import { GeneratorPage } from './pages/GeneratorPage'
import AgentsPage from './pages/AgentsPage'

// Mobile bottom navigation component
function MobileNav() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const openHistory = () => setHistoryOpen(true)
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {/* Generate Tab */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors relative ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px]">Generate</span>
          {currentPath === '/' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
          )}
        </NavLink>

        {/* Agents Tab */}
        <NavLink
          to="/agents"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors relative ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-[10px]">Agents</span>
          {currentPath === '/agents' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
          )}
        </NavLink>

        {/* Discover Tab */}
        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors relative ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
            }`
          }
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[10px]">Discover</span>
          {currentPath === '/discover' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
          )}
        </NavLink>

        {/* History Tab */}
        <button
          onClick={openHistory}
          className={`flex flex-col items-center gap-1 transition-colors relative ${historyOpen ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
            }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[10px]">History</span>
          {historyOpen && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
          )}
        </button>

        {/* Theme Toggle */}
        <div className="flex flex-col items-center gap-1">
          <ThemeToggle variant="mobile" />
          <span className="text-[10px] text-[var(--text-muted)]">Theme</span>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen immersive Agents page (No Layout) */}
        <Route path="/agents" element={<AgentsPage />} />

        {/* All other pages with global Layout */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="pb-20 md:pb-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/discover/:id" element={<DiscoverDetailPage />} />
                  <Route path="/generate" element={<GeneratorPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <MobileNav />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}