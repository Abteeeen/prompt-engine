import React from 'react'
import { Link } from 'react-router-dom'
import { LEGAL_LAST_UPDATED } from '../config'

interface Props {
  title: string
  intro: string
  children: React.ReactNode
}

export function LegalLayout({ title, intro, children }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500">Last updated {LEGAL_LAST_UPDATED}</p>
        <p className="text-base text-gray-400 mt-4 leading-relaxed">{intro}</p>
      </div>
      <div className="glass p-6 sm:p-10 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        {children}
      </div>
      <div className="mt-8 flex items-center gap-5 text-sm">
        <Link to="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
        <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
        <Link to="/" className="text-gray-500 hover:text-white ml-auto">Back home</Link>
      </div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="text-base font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-400 leading-relaxed">{children}</div>
    </section>
  )
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5"><span className="text-purple-400 shrink-0">•</span><span>{item}</span></li>
      ))}
    </ul>
  )
}
