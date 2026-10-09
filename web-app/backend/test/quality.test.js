import { describe, it, expect } from 'vitest';
import { scorePrompt, buildQualityScore, DIMENSION_META } from '../src/services/QualityScorerService.js';

describe('QualityScorerService', () => {
  it('exposes ten dimensions', () => {
    expect(DIMENSION_META).toHaveLength(10);
    expect(DIMENSION_META.map(d => d.key)).toContain('clarity');
  });

  it('heuristic score stays within 0..30 and reports its method', () => {
    const s = scorePrompt('ROLE: You are a senior copywriter.\nTASK: Write 3 subject lines.\nREQUIREMENTS:\n- under 6 words\nOUTPUT FORMAT: list');
    expect(s.overallScore).toBeGreaterThanOrEqual(0);
    expect(s.overallScore).toBeLessThanOrEqual(30);
    expect(s.method).toBe('heuristic');
    expect(Object.keys(s.breakdown)).toHaveLength(10);
  });

  it('builds a rubric score from a breakdown and clamps values', () => {
    const s = buildQualityScore({ clarity: 3, completeness: 7, constraints: -2, examples: 1.6 }, { suggestion: 'Add an example', method: 'llm-rubric' });
    expect(s.breakdown.clarity).toBe(3);
    expect(s.breakdown.completeness).toBe(3);
    expect(s.breakdown.constraints).toBe(0);
    expect(s.breakdown.examples).toBe(2);
    expect(s.method).toBe('llm-rubric');
    expect(s.suggestion).toBe('Add an example');
    expect(s.dimensions).toHaveLength(10);
  });
});
