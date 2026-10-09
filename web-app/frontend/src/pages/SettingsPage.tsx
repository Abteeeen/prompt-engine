import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../services/api'
import type { ProfileInput } from '../types'
import { RequireAuth } from '../components/RequireAuth'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { Spinner, TrashIcon } from '../components/ui/Icons'

const EMPTY: ProfileInput = { brand_voice: '', product_facts: '', audience: '', constraints: '' }

const FIELDS: { key: keyof ProfileInput; label: string; help: string; placeholder: string }[] = [
  { key: 'brand_voice', label: 'Brand voice', help: 'How you want everything to sound.', placeholder: 'e.g. Direct, warm, no buzzwords. Short sentences. British spelling.' },
  { key: 'product_facts', label: 'Product facts', help: 'Facts the AI should never get wrong.', placeholder: 'e.g. Acme is a B2B invoicing tool for freelancers. Pricing: free up to 5 clients, then $12/mo.' },
  { key: 'audience', label: 'Audience', help: 'Who the output is usually for.', placeholder: 'e.g. Freelance designers and small agencies, non-technical, time-poor.' },
  { key: 'constraints', label: 'Constraints', help: 'Hard rules, legal lines, things to avoid.', placeholder: 'e.g. Never promise tax advice. Do not mention competitors by name.' },
]

function BusinessContext() {
  const [values, setValues] = useState<ProfileInput>(EMPTY)
  const [saved, setSaved] = useState<ProfileInput>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api.profile
      .get()
      .then(p => {
        if (cancelled) return
        const next: ProfileInput = p
          ? { brand_voice: p.brand_voice ?? '', product_facts: p.product_facts ?? '', audience: p.audience ?? '', constraints: p.constraints ?? '' }
          : EMPTY
        setValues(next)
        setSaved(next)
      })
      .catch(err => {
        if (!cancelled) setLoadError(errorMessage(err, 'Could not load your business context.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const dirty = FIELDS.some(f => values[f.key] !== saved[f.key])

  const save = async () => {
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const p = await api.profile.update(values)
      const next: ProfileInput = { brand_voice: p.brand_voice ?? '', product_facts: p.product_facts ?? '', audience: p.audience ?? '', constraints: p.constraints ?? '' }
      setValues(next)
      setSaved(next)
      setStatus('Saved. Your next generation will use this context.')
      setTimeout(() => setStatus(''), 3500)
    } catch (err) {
      setError(errorMessage(err, 'Could not save. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="glass p-6 sm:p-8 rounded-2xl" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>
      <div className="mb-6">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Your business context</p>
        <h2 className="text-xl font-black text-white mb-1">Teach the engine about your business</h2>
        <p className="text-sm text-gray-500">Everything here is injected into every prompt you generate, so you never have to repeat yourself.</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {FIELDS.map(f => <div key={f.key} className="h-24 skeleton" />)}
        </div>
      )}

      {!loading && loadError && (
        <p className="text-sm text-red-400">{loadError}</p>
      )}

      {!loading && !loadError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FIELDS.map(f => (
              <Textarea
                key={f.key}
                label={f.label}
                help={f.help}
                placeholder={f.placeholder}
                rows={4}
                value={values[f.key]}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value.slice(0, 2000) }))}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Button variant="primary" size="md" loading={saving} disabled={!dirty} onClick={save}>
              Save context
            </Button>
            {status && <span className="text-xs text-emerald-400">{status}</span>}
            {error && <span className="text-xs text-red-400">{error}</span>}
            {!status && !error && dirty && <span className="text-xs text-white/40">Unsaved changes</span>}
          </div>
        </>
      )}
    </section>
  )
}

function Account() {
  const { user, usage, signOut, clearSession, refresh } = useAuth()
  const [share, setShare] = useState<boolean>(user?.share_examples !== false)
  const [shareSaving, setShareSaving] = useState(false)
  const [shareNote, setShareNote] = useState('')
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  if (!user) return null

  const deleteAccount = async () => {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setDeleting(true)
    setError('')
    try {
      await api.auth.deleteAccount()
      clearSession()
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Could not delete your account. Please try again or contact support.'))
      setDeleting(false)
      setConfirm(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  const toggleShare = async () => {
    const next = !share
    setShare(next)
    setShareSaving(true)
    setShareNote('')
    try {
      await api.auth.setPreferences({ share_examples: next })
      await refresh()
      setShareNote(next ? 'Thanks. Your best prompts can now help others.' : 'Done. Nothing you create will be shared, and past contributions were withdrawn.')
    } catch (err) {
      setShare(!next)
      setShareNote(errorMessage(err, 'Could not update this setting. Please try again.'))
    } finally {
      setShareSaving(false)
    }
  }

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : null

  return (
    <section className="glass p-6 sm:p-8 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Account</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Email</p>
          <p className="text-white font-medium break-all">{user.email}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Plan</p>
          <p className="text-white font-medium capitalize">
            {user.plan}
            {usage && usage.limit !== null && <span className="text-white/40 font-normal"> · {usage.limit} generations / day</span>}
            {usage && usage.limit === null && <span className="text-white/40 font-normal"> · unlimited</span>}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Member since</p>
          <p className="text-white font-medium">{memberSince ?? '—'}</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-sm text-white font-medium">Help improve Prompt Engine</p>
          <p className="text-xs text-white/50 mt-1 max-w-xl">
            When a prompt you generate scores highly and you copy, save or mark it helpful, an anonymised copy (emails, phone numbers and links removed) can be used as an example to improve results for everyone. Your name and email are never included.
          </p>
          {shareNote && <p className="text-xs text-purple-300 mt-2">{shareNote}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={share}
          aria-label="Help improve Prompt Engine"
          disabled={shareSaving}
          onClick={toggleShare}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${share ? 'bg-purple-500' : 'bg-white/15'} ${shareSaving ? 'opacity-60' : ''}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${share ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Button variant="secondary" size="sm" loading={signingOut} onClick={handleSignOut}>Sign out</Button>
        <Button variant="danger" size="sm" disabled={deleting} onClick={deleteAccount}>
          {deleting ? <Spinner className="w-3.5 h-3.5" /> : <TrashIcon className="w-3.5 h-3.5" />}
          {confirm ? 'Yes, permanently delete my account' : 'Delete my account'}
        </Button>
        {confirm && !deleting && (
          <button onClick={() => setConfirm(false)} className="text-xs text-white/50 hover:text-white">Cancel</button>
        )}
      </div>
      <p className="text-[11px] text-white/40 mt-3">
        Deleting removes your account, saved prompts, history and business context. This cannot be undone.
      </p>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </section>
  )
}

export default function SettingsPage() {
  usePageTitle('Settings')
  return (
    <RequireAuth title="Settings" description="Sign in to set your business context and manage your account.">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500">Business context and account.</p>
        </div>
        <BusinessContext />
        <Account />
      </div>
    </RequireAuth>
  )
}
