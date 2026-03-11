import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the Phase 2 domain template markdown files
const TEMPLATES_DIR = path.join(
  __dirname,
  '../../../../Phase-2-templates/domain-templates'
);

// Static metadata per template file (filename → structured meta)
const TEMPLATE_META = {
  '1-CODE-GENERATION.md':         { id: 'code-generation',         name: 'Code Generation',         category: 'Development',      domain: 'Software Development',          qualityScore: 26 },
  '2-DATA-ANALYSIS.md':           { id: 'data-analysis',           name: 'Data Analysis',           category: 'Analytics',        domain: 'Data & Business Intelligence',  qualityScore: 28 },
  '3-CONTENT-WRITING.md':         { id: 'content-writing',         name: 'Content Writing',         category: 'Content',          domain: 'Marketing & Content',           qualityScore: 27 },
  '4-CUSTOMER-SERVICE.md':        { id: 'customer-service',        name: 'Customer Service',        category: 'Support',          domain: 'Customer Experience',           qualityScore: 25 },
  '5-EMAIL-WRITING.md':           { id: 'email-writing',           name: 'Email Writing',           category: 'Communication',    domain: 'Business Communication',        qualityScore: 27 },
  '6-SOCIAL-MEDIA.md':            { id: 'social-media',            name: 'Social Media',            category: 'Marketing',        domain: 'Social Media Marketing',        qualityScore: 26 },
  '7-RESEARCH-SUMMARIZATION.md':  { id: 'research-summarization',  name: 'Research Summarization',  category: 'Research',         domain: 'Knowledge Management',          qualityScore: 28 },
  '8-TEACHING-EXPLANATION.md':    { id: 'teaching-explanation',    name: 'Teaching & Explanation',  category: 'Education',        domain: 'Learning & Development',        qualityScore: 27 },
  '9-PRODUCT-MANAGEMENT.md':      { id: 'product-management',      name: 'Product Management',      category: 'Product',          domain: 'Product Strategy',              qualityScore: 26 },
  '10-CREATIVE-BRAINSTORMING.md': { id: 'creative-brainstorming',  name: 'Creative Brainstorming',  category: 'Creativity',       domain: 'Innovation & Ideation',         qualityScore: 25 },
  '11-COLD-OUTREACH.md':          { id: 'cold-outreach',           name: 'Cold Outreach Sequence',  category: 'Sales',            domain: 'Sales & Revenue',               qualityScore: 28 },
  '12-SALES-CALL-SCRIPT.md':      { id: 'sales-call-script',       name: 'Sales Call Script',       category: 'Sales',            domain: 'Sales & Revenue',               qualityScore: 28 },
  '13-OBJECTION-HANDLING.md':     { id: 'objection-handling',      name: 'Objection Handling',      category: 'Sales',            domain: 'Sales & Revenue',               qualityScore: 28 },
  '14-YOUTUBE-SCRIPT.md':         { id: 'youtube-script',          name: 'YouTube Script',          category: 'Multimedia',       domain: 'Video & Content Creation',      qualityScore: 28 },
  '15-PODCAST-OUTLINE.md':       { id: 'podcast-outline',         name: 'Podcast Episode Outline', category: 'Multimedia',       domain: 'Audio & Podcasting',            qualityScore: 28 },
  '16-TIKTOK-HOOK.md':           { id: 'tiktok-hook',             name: 'TikTok & Reels Hook',    category: 'Multimedia',       domain: 'Short-Form Video',              qualityScore: 28 },
  '17-CONTRACT-DRAFTING.md':      { id: 'contract-drafting',       name: 'Contract Drafting',       category: 'Legal',            domain: 'Legal & Compliance',            qualityScore: 28 },
  '18-PRIVACY-POLICY.md':        { id: 'privacy-policy',            name: 'Privacy Policy Generator', category: 'Legal',           domain: 'Legal & Compliance',            qualityScore: 28 },
  '19-BUSINESS-PLAN.md':         { id: 'business-plan',           name: 'Business Plan Writer',    category: 'Business',         domain: 'Finance & Strategy',            qualityScore: 28 },
  '20-PITCH-DECK.md':            { id: 'pitch-deck',              name: 'Pitch Deck Narrative',    category: 'Business',         domain: 'Fundraising & Investment',      qualityScore: 28 },
  '21-FINANCIAL-ANALYSIS.md':    { id: 'financial-analysis',      name: 'Financial Analysis',      category: 'Business',         domain: 'Finance & Modeling',            qualityScore: 28 },
  '22-DAILY-PLANNING.md':        { id: 'daily-planning',          name: 'Daily Planning System',   category: 'Productivity',     domain: 'Personal Productivity',         qualityScore: 28 },
  '23-DECISION-MAKING.md':       { id: 'decision-making',         name: 'Decision Framework',      category: 'Productivity',     domain: 'Personal Productivity',         qualityScore: 28 },
  '24-HABIT-BUILDING.md':        { id: 'habit-building',          name: 'Habit Building Plan',     category: 'Productivity',     domain: 'Personal Productivity',         qualityScore: 28 },
  '25-UX-COPY.md':               { id: 'ux-copy',                 name: 'UX Copy Writer',          category: 'Design',           domain: 'Design & Creative',             qualityScore: 28 },
  '26-BRAND-VOICE.md':           { id: 'brand-voice',             name: 'Brand Voice Guide',       category: 'Design',           domain: 'Design & Creative',             qualityScore: 28 },
  '27-JOB-DESCRIPTION.md':       { id: 'job-description',         name: 'Job Description Writer', category: 'HR',              domain: 'HR & People',                   qualityScore: 28 },
  '28-PERFORMANCE-REVIEW.md':    { id: 'performance-review',      name: 'Performance Review',      category: 'HR',             domain: 'HR & People',                   qualityScore: 28 },
  '29-COURSE-OUTLINE.md':        { id: 'course-outline',          name: 'Course Outline Builder', category: 'Education',       domain: 'Education & Learning',          qualityScore: 28 },
  '30-STUDY-PLAN.md':            { id: 'study-plan',              name: 'Study Plan Generator',   category: 'Education',       domain: 'Education & Learning',          qualityScore: 28 },
};

// In-memory cache — loaded once at startup
let _cache = null;

// ── Parsing helpers ──────────────────────────────────────────────────────────

function normalise(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Extract all fenced code blocks with their byte offsets.
 */
function extractAllCodeBlocks(markdown) {
  const blocks = [];
  const regex = /```[^\n]*\n([\s\S]*?)```/g;
  let m;
  while ((m = regex.exec(markdown)) !== null) {
    blocks.push({ text: m[1].trim(), start: m.index, end: m.index + m[0].length });
  }
  return blocks;
}

/**
 * Find the character offset of line N (0-based).
 */
function lineOffsets(lines) {
  const offsets = [];
  let pos = 0;
  for (const l of lines) {
    offsets.push(pos);
    pos += l.length + 1; // +1 for '\n'
  }
  return offsets;
}

/**
 * Find the first heading line index (0-based) containing keyword.
 */
function findHeading(lines, keyword) {
  return lines.findIndex(
    (l) => /^#{1,3}\s/.test(l) && l.toUpperCase().includes(keyword.toUpperCase())
  );
}

/**
 * Return code blocks whose start offset falls between offsets [from, to).
 */
function blocksInRange(allBlocks, from, to) {
  return allBlocks
    .filter((b) => b.start >= from && b.start < to)
    .map((b) => b.text);
}

/**
 * Extract bullet list items from lines.
 */
function extractBullets(lines) {
  return lines
    .filter((l) => /^\s*[-*]\s/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean);
}

/**
 * Extract [PLACEHOLDER] bracket names from combined template text.
 * Matches all-caps placeholders (with slashes, underscores, spaces).
 */
function extractBrackets(text) {
  const matches = text.match(/\[([A-Z][A-Z0-9_/\s]{1,50})\]/g) || [];
  return [...new Set(
    matches
      .map((m) => m.slice(1, -1).trim())
      .filter((m) => m.length > 1 && !/^\d+$/.test(m))
  )];
}

/**
 * Parse a single markdown template file into a structured object.
 */
function parseTemplate(filename, rawMarkdown, meta) {
  const markdown = normalise(rawMarkdown);
  const lines    = markdown.split('\n');
  const offsets  = lineOffsets(lines);
  const blocks   = extractAllCodeBlocks(markdown);

  // Find heading line indices
  const tmplIdx  = findHeading(lines, '🎯 TEMPLATE');
  const quickIdx = findHeading(lines, 'QUICK FILL');
  const exIdx    = findHeading(lines, 'REAL EXAMPLES');
  const varIdx   = findHeading(lines, 'VARIATIONS');
  const tipsIdx  = findHeading(lines, 'PRO TIPS');
  const qlIdx    = findHeading(lines, 'QUALITY CHECKLIST');

  // All heading positions as offsets (for range calculations)
  const headingOffsets = lines
    .map((l, i) => (/^#{1,3}\s/.test(l) ? offsets[i] : -1))
    .filter((o) => o !== -1);

  function nextHeadingOffset(lineIdx) {
    if (lineIdx === -1) return Infinity;
    const cur = offsets[lineIdx];
    return headingOffsets.find((o) => o > cur) ?? Infinity;
  }

  function sectionBlocks(headingLineIdx) {
    if (headingLineIdx === -1) return [];
    const from = offsets[headingLineIdx];
    const to   = nextHeadingOffset(headingLineIdx);
    return blocksInRange(blocks, from, to);
  }

  function sectionLines(headingLineIdx) {
    if (headingLineIdx === -1) return [];
    const nextOff = nextHeadingOffset(headingLineIdx);
    const nextLine = lines.findIndex((_, i) => i > headingLineIdx && offsets[i] >= nextOff);
    const end = nextLine === -1 ? lines.length : nextLine;
    return lines.slice(headingLineIdx + 1, end);
  }

  const mainTemplate  = sectionBlocks(tmplIdx)[0]  || '';
  const quickTemplate = sectionBlocks(quickIdx)[0] || '';
  const brackets      = extractBrackets(mainTemplate + '\n' + quickTemplate);

  const description = (markdown.match(/\*\*Best For\*\*:\s*(.+)/) || [])[1]?.trim() ?? meta.domain;

  return {
    id:              meta.id,
    name:            meta.name,
    description,
    category:        meta.category,
    domain:          meta.domain,
    qualityScore:    meta.qualityScore,
    brackets,
    mainTemplate,
    quickTemplate,
    examples:        sectionBlocks(exIdx),
    variations:      sectionBlocks(varIdx),
    proTips:         extractBullets(sectionLines(tipsIdx)),
    qualityChecklist: extractBullets(sectionLines(qlIdx)),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function loadTemplates() {
  if (_cache) return _cache;

  const templates = [];
  const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const meta = TEMPLATE_META[file];
    if (!meta) {
      logger.warn('No metadata for template file, skipping', { file });
      continue;
    }
    try {
      const markdown = readFileSync(path.join(TEMPLATES_DIR, file), 'utf8');
      const parsed   = parseTemplate(file, markdown, meta);
      templates.push(parsed);
      logger.debug('Loaded template', { id: parsed.id, brackets: parsed.brackets.length });
    } catch (err) {
      logger.error('Failed to parse template', { file, error: err.message });
    }
  }

  templates.sort((a, b) => {
    const ai = Object.keys(TEMPLATE_META).findIndex((k) => TEMPLATE_META[k].id === a.id);
    const bi = Object.keys(TEMPLATE_META).findIndex((k) => TEMPLATE_META[k].id === b.id);
    return ai - bi;
  });

  _cache = templates;
  logger.info(`Loaded ${templates.length} templates`);
  return templates;
}

export function getTemplateById(id) {
  return loadTemplates().find((t) => t.id === id) || null;
}

export function listTemplates() {
  return loadTemplates().map(({ id, name, description, category, domain, qualityScore }) => ({
    id, name, description, category, domain, qualityScore,
  }));
}
