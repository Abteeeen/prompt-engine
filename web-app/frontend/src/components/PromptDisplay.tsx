import React, { useState } from 'react'
import type { GenerateResult } from '../types'
import { QualityScore, QualityScoreMini } from './QualityScore'
import { Button } from './ui/Button'

type PromptDisplayState = { selectedIndex: number; editedText: string }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  const copy = async () => {
    setFailed(false)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setFailed(true)
      setTimeout(() => setFailed(false), 2500)
    }
  }

  return (
    <Button size="sm" variant={copied ? 'primary' : failed ? 'secondary' : 'secondary'} onClick={copy}>
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          Copied!
        </>
      ) : failed ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/></svg>
          Copy failed
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </>
      )}
    </Button>
  )
}

export function PromptDisplay({ 
  result, 
  onStateChange, 
  onCopy, 
  onOptimize, 
  onArena 
}: { 
  result: GenerateResult; 
  onStateChange?: (s: PromptDisplayState) => void; 
  onCopy?: () => void;
  onOptimize?: (text: string) => void;
  onArena?: (text: string) => void;
}) {
  const [selected, setSelected] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [edited, setEdited]       = useState(result.variations[0].text)

  // Keep edited in sync when variation changes
  const handleTabChange = (i: number) => {
    setSelected(i)
    setEdited(result.variations[i].text)
    onStateChange?.({ selectedIndex: i, editedText: result.variations[i].text })
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Variation tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {result.variations.map((v, i) => (
          <button
            key={i}
            onClick={() => handleTabChange(i)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${selected === i ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Editable prompt box */}
      <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2">
            <QualityScoreMini data={result.qualityScore} />
            <span className="text-xs text-gray-600">· Edit freely below</span>
          </div>
          <div className="flex items-center gap-2">
            {onOptimize && (
              <Button size="sm" variant="secondary" onClick={() => onOptimize(edited)}>
                ✨ Optimize
              </Button>
            )}
            {onArena && (
              <Button size="sm" variant="secondary" onClick={() => onArena(edited)}>
                ⚔️ Arena
              </Button>
            )}
            <div onClickCapture={() => onCopy?.()}>
              <CopyButton text={edited} />
            </div>
          </div>
        </div>
        <textarea
          value={edited}
          onChange={e => {
            const next = e.target.value
            setEdited(next)
            onStateChange?.({ selectedIndex: selected, editedText: next })
          }}
          className="w-full bg-transparent p-4 text-sm text-gray-200 font-mono leading-relaxed focus:outline-none resize-none"
          style={{ minHeight: '200px', maxHeight: '360px' }}
          spellCheck={false}
        />
      </div>

      {/* Toggle full quality score */}
      <button
        onClick={() => setShowScore(s => !s)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors w-full"
      >
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span>{showScore ? 'Hide' : 'Show'} quality breakdown</span>
        <svg className={`w-3 h-3 transition-transform ${showScore ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </button>

      {showScore && <QualityScore data={result.qualityScore} />}
    </div>
  )
}
