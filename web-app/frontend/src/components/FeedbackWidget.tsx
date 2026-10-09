import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api, errorMessage } from '../services/api'
import { Button } from './ui/Button'

export const OPEN_FEEDBACK_EVENT = 'pe:open-feedback'

/** Opens the feedback widget from anywhere (e.g. the footer link). */
export function openFeedback() {
  window.dispatchEvent(new CustomEvent(OPEN_FEEDBACK_EVENT))
}

const MOODS: { key: number; label: string; title: string }[] = [
  { key: 5, label: ':D', title: 'Love it' },
  { key: 4, label: ':)', title: 'Good' },
  { key: 3, label: ':|', title: 'Okay' },
  { key: 2, label: ':(', title: 'Not great' },
  { key: 1, label: ":'(", title: 'Frustrating' },
]

export function FeedbackWidget() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => {
      setOpen(true)
      setSent(false)
      setError('')
      // On mobile the widget is inline near the bottom; bring it into view.
      setTimeout(() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
    window.addEventListener(OPEN_FEEDBACK_EVENT, handler)
    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, handler)
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.feedback.send({
        message: message.trim(),
        email: email.trim() || undefined,
        page: pathname,
        rating: rating ?? undefined,
      })
      setSent(true)
      setMessage('')
      setEmail('')
      setRating(null)
      setTimeout(() => {
        setSent(false)
        setOpen(false)
      }, 2000)
    } catch (err) {
      setError(errorMessage(err, 'Could not send feedback. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={rootRef} className="z-40 flex justify-center w-full md:w-auto md:fixed md:bottom-4 md:right-4 mt-8 md:mt-0">
      {!open && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen(true)}
          className="shadow-lg shadow-purple-500/30 bg-black/40 border border-white/15"
        >
          <span className="text-xs">Feedback</span>
        </Button>
      )}

      {open && (
        <div className="glass w-80 max-w-[calc(100vw-32px)] rounded-2xl p-4 text-xs shadow-2xl border border-white/15">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">Your feedback</p>
              <p className="text-[11px] text-gray-500">Tell us what works and what doesn&apos;t.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-300 text-xs"
              aria-label="Close feedback"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          {sent ? (
            <div className="py-6 text-center">
              <p className="text-sm font-semibold text-emerald-400">Thank you!</p>
              <p className="text-[11px] text-gray-500 mt-1">We read every message.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 5000))}
                  placeholder="What's on your mind? Bugs, ideas, anything."
                  rows={3}
                  className="w-full input-base text-xs bg-white/5 border-white/15"
                />
                <div className="text-[10px] text-gray-500 text-right mt-0.5">{message.length}/5000</div>
              </div>

              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional, if you want a reply)"
                type="email"
                className="w-full input-base text-xs bg-white/3 border-white/10"
              />

              <div>
                <p className="text-[11px] text-gray-500 mb-1">How satisfied are you? (optional)</p>
                <div className="flex gap-1.5">
                  {MOODS.map(m => (
                    <button
                      key={m.key}
                      type="button"
                      title={m.title}
                      onClick={() => setRating(rating === m.key ? null : m.key)}
                      className={`h-7 px-2 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                        rating === m.key ? 'bg-purple-500/30 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-[11px] text-red-400">{error}</p>}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-600">We read every message.</span>
                <Button
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  disabled={!message.trim()}
                  onClick={handleSubmit}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
