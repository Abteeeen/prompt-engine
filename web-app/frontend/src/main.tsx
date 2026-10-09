import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { GOOGLE_CLIENT_ID } from './config'
import './index.css'

/**
 * Loud startup check: in production the frontend must know where the API lives.
 * Without VITE_API_URL every /api call would hit the SPA rewrite and return index.html.
 */
function ConfigurationError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-8 rounded-2xl max-w-lg w-full" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
        <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Configuration error</p>
        <h1 className="text-xl font-black text-white mb-3">VITE_API_URL is not set</h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          This build was deployed without a backend URL, so every API request would be answered by the frontend itself.
          Set the <code className="font-mono text-purple-300">VITE_API_URL</code> environment variable to your backend origin
          (for example <code className="font-mono text-purple-300">https://api.your-domain.com</code>) and redeploy.
        </p>
        <p className="text-xs text-gray-500">The variable is read at build time, so a redeploy is required after changing it.</p>
      </div>
    </div>
  )
}

const missingApiUrl = import.meta.env.PROD && !import.meta.env.VITE_API_URL

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {missingApiUrl ? (
      <ConfigurationError />
    ) : (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    )}
  </React.StrictMode>
)
