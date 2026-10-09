import React, { useState } from 'react'
import type { GenerateResult } from '../types'
import { QualityScore, QualityScoreMini } from './QualityScore'
import { Button } from './ui/Button'
import { ResultActions } from './ResultActions'
import { SparkleIcon } from './ui/Icons'

type PromptDisplayState = { selectedIndex: number; editedText: string }

interface Props {
  result: GenerateResult
  /** Domain of the template, used when saving to the library. */
  domain?: string | null
  onStateChange?: (s: PromptDisplayState) => void
  onCopy?: () => void
  onOptimize?: (text: string) => void
  optimizing?: boolean
}

export function PromptDisplay({ result, domain, onStateChange, onCopy, onOptimize, optimizing }: Props) {
  const [selected, setSelected] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [edited, setEdited] = useState(result.variations[0]?.text ?? result.prompt)

  const handleTabChange = (i: number) => {
    setSelected(i)
    const text = result.variations[i]?.text ?? ''
    setEdited(text)
    onStateChange?.({ selectedIndex: i, editedText: text })
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {result.variations.length > 1 && (
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
      )}

      <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <QualityScoreMini data={result.qualityScore} />
            <span className="text-xs text-gray-600 hidden sm:inline">· Edit freely below</span>
          </div>
          {onOptimize && (
            <Button size="sm" variant="secondary" loading={optimizing} onClick={() => onOptimize(edited)}>
              <SparkleIcon className="w-3.5 h-3.5" />
              Optimize
            </Button>
          )}
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

      <ResultActions
        prompt={edited}
        title={result.templateName}
        domain={domain}
        score={result.qualityScore?.overallScore}
        onCopy={onCopy}
      />

      <button onClick={() => setShowScore(s => !s)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors w-full">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span>{showScore ? 'Hide' : 'Show'} quality breakdown</span>
        <svg className={`w-3 h-3 transition-transform ${showScore ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </button>

      {showScore && <QualityScore data={result.qualityScore} />}
    </div>
  )
}
