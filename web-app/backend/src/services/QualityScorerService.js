/**
 * 30-point prompt quality scorer.
 * 10 dimensions × 3 points each.
 */

const SCORING_DIMENSIONS = [
  {
    key: 'clarity',
    label: 'Clarity',
    description: 'Is it clear what\'s being asked?',
    checks: [
      (text) => text.length > 50,                          // Not too short
      (text) => !/\[.+\]/.test(text),                      // No unfilled brackets
      (text) => (text.match(/\n/g) || []).length >= 2,     // Has structure
    ],
  },
  {
    key: 'completeness',
    label: 'Completeness',
    description: 'Does it have all key details?',
    checks: [
      (text) => text.length > 150,
      (text) => /requirement|task|goal|objective/i.test(text),
      (text) => /input|output|result|deliver/i.test(text),
    ],
  },
  {
    key: 'constraints',
    label: 'Constraints',
    description: 'Are boundaries and limits defined?',
    checks: [
      (text) => /constraint|must|should|limit|only|avoid|not/i.test(text),
      (text) => /format|structure|length|style/i.test(text),
      (text) => /constraint|requirement|rule/i.test(text),
    ],
  },
  {
    key: 'examples',
    label: 'Examples',
    description: 'Does it include examples or sample data?',
    checks: [
      (text) => /example|e\.g\.|sample|such as|like|instance/i.test(text),
      (text) => /```|`[^`]+`/.test(text),                  // Has code or inline examples
      (text) => /show|demonstrate|illustrate/i.test(text),
    ],
  },
  {
    key: 'context',
    label: 'Context',
    description: 'Is there sufficient background information?',
    checks: [
      (text) => /you are|act as|role|expert|senior|specialist/i.test(text),
      (text) => text.length > 200,
      (text) => /background|context|situation|scenario/i.test(text),
    ],
  },
  {
    key: 'actionability',
    label: 'Actionability',
    description: 'Can someone act on this clearly?',
    checks: [
      (text) => /task|write|create|generate|analyze|build|explain|summarize/i.test(text),
      (text) => /step|first|then|finally|output/i.test(text),
      (text) => text.split('\n').some((l) => /^[-*\d]/.test(l.trim())),  // Has a list
    ],
  },
  {
    key: 'specificity',
    label: 'Specificity',
    description: 'Are requirements specific and precise?',
    checks: [
      (text) => /\b(exactly|specific|precisely|minimum|maximum|at least|no more)\b/i.test(text),
      (text) => /\d+/.test(text),                           // Contains numbers
      (text) => text.length > 300,
    ],
  },
  {
    key: 'tone',
    label: 'Tone Appropriateness',
    description: 'Is the tone appropriate for the use case?',
    checks: [
      (text) => !/wtf|lol|haha|omg/i.test(text),           // No informal slang
      (text) => text[0] === text[0].toUpperCase(),          // Starts with capital
      (text) => !/!!!|!!!/.test(text),                      // Not overly excited
    ],
  },
  {
    key: 'structure',
    label: 'Structure',
    description: 'Is it well-organized and readable?',
    checks: [
      (text) => (text.match(/\n/g) || []).length >= 3,
      (text) => /:\n|:\s*\n/.test(text),                   // Has labeled sections
      (text) => text.split('\n').length > 5,
    ],
  },
  {
    key: 'measurability',
    label: 'Measurability',
    description: 'Are success criteria or expected outputs clear?',
    checks: [
      (text) => /expected|output|result|deliver|return|produce/i.test(text),
      (text) => /checklist|criteria|verify|ensure|confirm/i.test(text),
      (text) => /quality|standard|requirement|acceptance/i.test(text),
    ],
  },
];

function getRating(score) {
  if (score >= 27) return 'Excellent';
  if (score >= 22) return 'Good';
  if (score >= 16) return 'Okay';
  return 'Needs Work';
}

function getSuggestion(breakdown) {
  const lowest = Object.entries(breakdown).sort(([, a], [, b]) => a - b)[0];
  const suggestions = {
    clarity:        'Make the request more specific — avoid vague wording.',
    completeness:   'Add input/output descriptions or a clear goal.',
    constraints:    'Add constraints: format, length, style, or limitations.',
    examples:       'Include a concrete example or sample output.',
    context:        'Add a role definition: "You are a senior [X] expert..."',
    actionability:  'Start with a clear action verb: Write, Create, Analyze...',
    specificity:    'Add specific numbers, deadlines, or measurable targets.',
    tone:           'Check that the tone matches your intended audience.',
    structure:      'Break the prompt into labeled sections (TASK, REQUIREMENTS, etc).',
    measurability:  'Define what success looks like or what the expected output is.',
  };
  return suggestions[lowest[0]] || 'Looks great — try adding more examples for even better results.';
}

/** Dimension metadata (key, label, description) for rubric-based scorers. */
export const DIMENSION_META = SCORING_DIMENSIONS.map(({ key, label, description }) => ({ key, label, description }));

/**
 * Build a quality-score object (same shape as scorePrompt) from a breakdown
 * produced elsewhere, e.g. the LLM critic's rubric.
 */
export function buildQualityScore(breakdown, { suggestion, method = 'llm-rubric' } = {}) {
  const clean = {};
  let total = 0;
  for (const d of SCORING_DIMENSIONS) {
    const v = Number(breakdown?.[d.key]);
    clean[d.key] = Number.isFinite(v) ? Math.max(0, Math.min(3, Math.round(v))) : 0;
    total += clean[d.key];
  }
  return {
    overallScore: total,
    breakdown: clean,
    rating: getRating(total),
    suggestion: suggestion || getSuggestion(clean),
    method,
    dimensions: SCORING_DIMENSIONS.map((d) => ({
      key: d.key, label: d.label, description: d.description, score: clean[d.key], maxScore: 3,
    })),
  };
}

/**
 * Score a prompt text on the 30-point scale (regex heuristics).
 */
export function scorePrompt(promptText) {
  const text = promptText || '';
  const breakdown = {};
  let total = 0;

  for (const dim of SCORING_DIMENSIONS) {
    const passed = dim.checks.filter((fn) => {
      try { return fn(text); } catch { return false; }
    }).length;
    breakdown[dim.key] = passed;  // 0–3
    total += passed;
  }

  return {
    overallScore: total,                    // 0–30
    breakdown,                              // { clarity: 3, completeness: 2, ... }
    rating: getRating(total),
    suggestion: getSuggestion(breakdown),
    method: 'heuristic',
    dimensions: SCORING_DIMENSIONS.map((d) => ({
      key: d.key,
      label: d.label,
      description: d.description,
      score: breakdown[d.key],
      maxScore: 3,
    })),
  };
}
