import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      console.error('Unhandled render error', error)
    }
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass p-8 rounded-2xl max-w-md w-full text-center" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-6">
            The page hit an unexpected error. Reloading usually fixes it. Nothing you generated is lost on the server.
          </p>
          <button
            onClick={this.reload}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white bg-gradient-brand shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-95"
          >
            Reload page
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-6 text-left text-[11px] text-red-300/80 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
          )}
        </div>
      </div>
    )
  }
}
