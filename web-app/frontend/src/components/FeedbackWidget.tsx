import React, { useState } from 'react'
import { api } from '../services/api'
import { Button } from './ui/Button'

const FACES = [
  { key: 'very_happy', label: '😊' },
  { key: 'happy', label: '🙂' },
  { key: 'neutral', label: '😐' },
  { key: 'unhappy', label: '🙁' },
  { key: 'sad', label: '😢' },
] as const

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [context, setContext] = useState('')
  const [email, setEmail] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) return
    setSubmitting(true)
    try {
      api.analytics.track('feedback_submitted', undefined, {
        feedback,
        context,
        email: email || null,
        mood,
      })
      setSent(true)
      setFeedback('')
      setContext('')
      setEmail('')
      setMood(null)
      setTimeout(() => {
        setSent(false)
        setOpen(false)
      }, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="z-40 flex justify-center w-full md:w-auto md:fixed md:bottom-4 md:right-4 mt-8 mb-24 md:mt-0 md:mb-0">
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
        <div className="glass w-80 max-w-[90vw] rounded-2xl p-4 text-xs shadow-2xl border border-white/15">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-widest">Your feedback</p>
              <p className="text-[11px] text-gray-500">Tell us what works and what doesn&apos;t.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-300 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value.slice(0, 5000))}
                placeholder="Tell us what's on your mind..."
                rows={3}
                className="w-full input-base text-xs bg-white/5 border-white/15"
              />
              <div className="text-[10px] text-gray-500 text-right mt-0.5">{feedback.length}/5000</div>
            </div>

            <div>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value.slice(0, 500))}
                placeholder="What were you trying to do? (optional)"
                rows={2}
                className="w-full input-base text-xs bg-white/3 border-white/10"
              />
              <div className="text-[10px] text-gray-500 text-right mt-0.5">{context.length}/500</div>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="flex-1 input-base text-xs bg-white/3 border-white/10"
              />
            </div>

            <div>
              <p className="text-[11px] text-gray-500 mb-1">How satisfied are you? (optional)</p>
              <div className="flex gap-1.5">
                {FACES.map(face => (
                  <button
                    key={face.key}
                    type="button"
                    onClick={() => setMood(face.key)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-base transition-all ${
                      mood === face.key ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {face.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-600">We read every message.</span>
              <Button
                variant="primary"
                size="sm"
                loading={submitting}
                disabled={!feedback.trim()}
                onClick={handleSubmit}
              >
                {sent ? 'Thank you!' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

