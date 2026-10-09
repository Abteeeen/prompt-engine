import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { Layout } from './components/layout/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuth } from './context/AuthContext'
import { openHistory } from './components/PromptHistory'
import { BookmarkIcon, ClockIcon, GridIcon, HomeIcon, ZapIcon } from './components/ui/Icons'

const HomePage = lazy(() => import('./pages/HomePage'))
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'))
const TemplateDetailPage = lazy(() => import('./pages/TemplateDetailPage'))
const GeneratorPage = lazy(() => import('./pages/GeneratorPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const LibraryDetailPage = lazy(() => import('./pages/LibraryDetailPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-4 animate-fade-in" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-48 skeleton" />
      <div className="h-12 w-full max-w-lg skeleton" />
      <div className="h-64 w-full skeleton" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

/** /discover/:id → /templates/:id */
function LegacyDiscoverRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={id ? `/templates/${encodeURIComponent(id)}` : '/templates'} replace />
}

// ── Mobile bottom navigation ─────────────────────────────────────────────────

function MobileNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/templates', label: 'Templates', icon: GridIcon },
    { to: '/generate', label: 'Generate', icon: ZapIcon },
    ...(user ? [{ to: '/library', label: 'Library', icon: BookmarkIcon }] : []),
  ]

  const handleHistory = () => {
    if (pathname !== '/') {
      navigate('/')
      // Let the home page mount before asking it to open the drawer.
      setTimeout(openHistory, 350)
    } else {
      openHistory()
    }
  }

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 transition-colors relative ${active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => tabClass(isActive)}>
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{label}</span>
                {isActive && <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[var(--accent)]" />}
              </>
            )}
          </NavLink>
        ))}

        <button onClick={handleHistory} className={tabClass(false)} aria-label="Open prompt history">
          <ClockIcon className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <ThemeToggle variant="mobile" />
          <span className="text-[10px] text-[var(--muted)]">Theme</span>
        </div>
      </div>
    </nav>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              <Route path="/generate" element={<GeneratorPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/:id" element={<LibraryDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Legacy routes */}
              <Route path="/discover" element={<Navigate to="/templates" replace />} />
              <Route path="/discover/:id" element={<LegacyDiscoverRedirect />} />
              <Route path="/agents" element={<Navigate to="/" replace />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
      <MobileNav />
    </BrowserRouter>
  )
}
