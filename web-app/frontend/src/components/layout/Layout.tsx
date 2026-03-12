import React from 'react'
import { Header } from './Header'
import { FeedbackWidget } from '../FeedbackWidget'
import { ParticleMeshBg } from '../ParticleMeshBg'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ParticleMeshBg />
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/6 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>
      <Header />
      <main className="pt-20 relative z-10">{children}</main>
      <FeedbackWidget />
    </div>
  )
}
