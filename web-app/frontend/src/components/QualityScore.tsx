import React from 'react'
import { QualityScoreRing } from './QualityScoreRing'
import type { QualityScore as QualityScoreType } from '../types'

export function QualityScoreMini({ data }: { data: QualityScoreType }) {
  if (!data) return null;
  const scoreColor = data.overallScore >= 26 ? 'text-emerald-400' :
                     data.overallScore >= 20 ? 'text-purple-400' :
                     data.overallScore >= 15 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold ${scoreColor}`}>★ {data.overallScore}/30</span>
      <span className="text-xs text-white/50">{data.rating}</span>
    </div>
  )
}

export function QualityScore({ data }: { data: QualityScoreType }) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <QualityScoreRing score={data.overallScore} />
      <div className="flex flex-col gap-1.5 ml-2">
        <span className="text-sm font-semibold text-white">Quality Analysis</span>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(data.breakdown || {}).map(([key, score]) => (
            <span key={key} className="text-xs text-white/60 capitalize">
              {key}: <span className="text-white/90">{score}/3</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
