import logger from '../utils/logger.js';
import { loadTemplates } from './TemplateService.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// ── Phase 1 Research: 45 Core Principles (injected into every call) ──────────
const RESEARCH_PRINCIPLES = `
PROMPT ENGINEERING PRINCIPLES (Phase 1 Research):

CLARITY PRINCIPLES:
1. Always define a specific role for the AI ("You are a senior X expert...")
2. State the exact task with an action verb (Write, Analyze, Create, Build)
3. Never use vague words — replace "good" with measurable criteria
4. Break complex tasks into numbered steps
5. Define what success looks like before the task begins

STRUCTURE PRINCIPLES:
6. Use labeled sections: ROLE, TASK, REQUIREMENTS, CONSTRAINTS, OUTPUT FORMAT
7. Put the most important instruction first
8. Use bullet points for requirements, not paragraphs
9. Separate context from instructions clearly
10. Always end with the expected output format

SPECIFICITY PRINCIPLES:
11. Include at least one concrete example when possible
12. Define length/format requirements explicitly (e.g. "300 words", "5 bullet points")
13. Specify the target audience for the output
14. Include measurable quality criteria
15. State what to AVOID, not just what to do

CONTEXT PRINCIPLES:
16. Provide background that changes how the task should be approached
17. Include relevant constraints upfront, not at the end
18. Mention the final use case for the output
19. Specify tone (formal/casual/technical/friendly)
20. Include domain-specific terminology when relevant

COMPLETENESS PRINCIPLES:
21. Always include input description (what data/info is being worked with)
22. Always include output description (exactly what should be returned)
23. Define edge cases and how to handle them
24. Include a quality checklist at the end when appropriate
25. Specify what happens if information is missing or unclear

ADVANCED PRINCIPLES:
26. Chain-of-thought: ask AI to reason step by step for complex problems
27. Few-shot examples dramatically improve output quality
28. Negative examples (what NOT to do) are as powerful as positive ones
29. Iterative refinement: build in a self-review step
30. Role + Task + Format is the minimum viable prompt structure
`;

// ── Domain Detection: maps user request keywords to template IDs ─────────────
const DOMAIN_KEYWORDS = {
  'code-generation': [
    'code', 'function', 'script', 'program', 'debug', 'refactor',
    'api', 'class', 'algorithm', 'implement', 'build', 'develop',
    'javascript', 'python', 'typescript', 'react', 'node', 'sql'
  ],
  'data-analysis': [
    'data', 'analyze', 'analysis', 'dataset', 'insight', 'chart',
    'graph', 'visualization', 'metric', 'report', 'statistics',
    'excel', 'csv', 'dashboard', 'trend', 'pattern'
  ],
  'content-writing': [
    'blog', 'article', 'post', 'write', 'content', 'landing page',
    'copywriting', 'seo', 'headline', 'introduction', 'guide',
    'tutorial', 'how to', 'listicle'
  ],
  'customer-service': [
    'customer', 'support', 'complaint', 'response', 'service',
    'ticket', 'escalation', 'refund', 'help', 'issue', 'problem',
    'client', 'user complaint'
  ],
  'email-writing': [
    'email', 'cold email', 'outreach', 'newsletter', 'campaign',
    'follow up', 'pitch', 'subject line', 'drip', 'sequence',
    'introduction email', 'sales email'
  ],
  'social-media': [
    'social media', 'instagram', 'twitter', 'linkedin', 'tiktok',
    'post', 'caption', 'hashtag', 'viral', 'engagement', 'thread',
    'tweet', 'reel', 'story'
  ],
  'research-summarization': [
    'research', 'summarize', 'summary', 'paper', 'report', 'article',
    'literature', 'review', 'findings', 'study', 'academic',
    'abstract', 'key points', 'takeaway'
  ],
  'teaching-explanation': [
    'explain', 'teach', 'tutorial', 'lesson', 'concept', 'understand',
    'learning', 'education', 'course', 'simple', 'beginner',
    'eli5', 'breakdown', 'guide me'
  ],
  'product-management': [
    'product', 'roadmap', 'feature', 'prioritize', 'user story',
    'backlog', 'sprint', 'mvp', 'launch', 'strategy', 'okr',
    'milestone', 'stakeholder', 'requirement'
  ],
  'creative-brainstorming': [
    'brainstorm', 'ideas', 'creative', 'concept', 'campaign',
    'innovate', 'generate ideas', 'think of', 'suggest', 'alternatives',
    'possibilities', 'options', 'what if'
  ],
};

// ── Detect best matching domain template ─────────────────────────────────────
function detectDomain(userRequest) {
  const lower = userRequest.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = domain;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

// ── Build system prompt with research + template context ─────────────────────
function buildSystemPrompt(detectedDomain) {
  const templates = loadTemplates();
  const template = detectedDomain
    ? templates.find(t => t.id === detectedDomain)
    : null;

  let systemPrompt = `You are the world's best prompt engineer — a senior expert with 15+ years crafting prompts that get exceptional results from any AI model.

When given a user's simple request, you transform it into a perfect, production-ready AI prompt. Your prompts consistently score 28-30/30 on quality metrics.

${RESEARCH_PRINCIPLES}

STRICT OUTPUT RULES:
- Output ONLY the prompt itself — no preamble, no "Here is your prompt:", no meta-commentary
- Always include: role definition, specific task, detailed requirements, constraints, expected output format
- Use labeled sections (ROLE, TASK, REQUIREMENTS, CONSTRAINTS, OUTPUT FORMAT)
- Be specific and measurable — no vague words without defining them
- Aim for 250-600 words depending on complexity
- The result must be immediately copy-pasteable into ChatGPT, Claude, Gemini, or any AI tool
- Apply ALL 30 principles above — your output must score 28+ on quality`;

  // Inject domain-specific template context if detected
  if (template) {
    systemPrompt += `\n\nDOMAIN CONTEXT (${template.name}):
You are generating a prompt for the "${template.name}" domain (${template.domain}).

`;

    if (template.proTips && template.proTips.length > 0) {
      systemPrompt += `EXPERT PRO TIPS FOR THIS DOMAIN:\n`;
      template.proTips.slice(0, 5).forEach((tip, i) => {
        systemPrompt += `${i + 1}. ${tip}\n`;
      });
    }

    if (template.qualityChecklist && template.qualityChecklist.length > 0) {
      systemPrompt += `\nQUALITY CHECKLIST FOR THIS DOMAIN:\n`;
      template.qualityChecklist.slice(0, 5).forEach((item, i) => {
        systemPrompt += `- ${item}\n`;
      });
    }

    if (template.mainTemplate) {
      systemPrompt += `\nEXPERT TEMPLATE STRUCTURE TO FOLLOW:\n${template.mainTemplate.slice(0, 800)}\n`;
    }
  }

  return systemPrompt;
}

// ── Main AI generation function ───────────────────────────────────────────────
export async function generateWithAI(userRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  // Detect domain from user request
  const detectedDomain = detectDomain(userRequest);
  if (detectedDomain) {
    logger.debug('Domain detected', { domain: detectedDomain });
  }

  if (!apiKey) {
    logger.warn('GROQ_API_KEY not set — using fallback generation');
    return fallbackGenerate(userRequest, detectedDomain);
  }

  try {
    const systemPrompt = buildSystemPrompt(detectedDomain);

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transform this request into a perfect prompt: ${userRequest}` },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API error ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty response from AI');

    logger.debug('AI prompt generated', {
      model: MODEL,
      tokens: data.usage?.total_tokens,
      domain: detectedDomain || 'generic',
    });

    return {
      prompt: text,
      model: MODEL,
      source: 'groq',
      domain: detectedDomain,
    };

  } catch (err) {
    logger.warn('AI generation failed, using fallback', { error: err.message });
    return fallbackGenerate(userRequest, detectedDomain);
  }
}

// ── Fallback: research-backed offline generation ──────────────────────────────
function fallbackGenerate(userRequest, detectedDomain) {
  const templates = loadTemplates();
  const template = detectedDomain
    ? templates.find(t => t.id === detectedDomain)
    : null;

  // Use domain template structure if available
  if (template && template.mainTemplate) {
    const filled = template.mainTemplate
      .replace(/\[TASK\/GOAL\]/gi, userRequest)
      .replace(/\[YOUR TASK\]/gi, userRequest)
      .replace(/\[DESCRIBE YOUR TASK\]/gi, userRequest)
      .slice(0, 1500);

    return {
      prompt: filled,
      model: 'template',
      source: 'template',
      domain: detectedDomain,
    };
  }

  // Generic research-backed fallback
  const prompt = `ROLE:
You are a world-class expert with deep knowledge relevant to the following task. Apply professional-grade precision, clarity, and domain expertise.

TASK:
${userRequest}

REQUIREMENTS:
- Provide a thorough, accurate, and well-structured response
- Be specific — use concrete examples, numbers, and measurable criteria
- Prioritise the most important information first
- Consider edge cases and common pitfalls proactively
- Ensure every output is immediately actionable

CONSTRAINTS:
- Do not make assumptions — if something is unclear, acknowledge it explicitly
- Be honest about uncertainty; never fabricate facts or statistics
- Keep the response focused and free of filler content
- Maintain a professional tone appropriate for the subject matter

CONTEXT:
Treat this as a high-stakes deliverable being reviewed by a senior expert. The output must meet production-ready standards.

OUTPUT FORMAT:
- Use clear headings and bullet points where appropriate
- Lead with the most critical information
- Include a brief action summary at the end
- Highlight any warnings, caveats, or important considerations

QUALITY STANDARD:
Every claim must be accurate. Every recommendation must be actionable. Every section must add value.`;

  return {
    prompt,
    model: 'fallback',
    source: 'template',
    domain: null,
  };
}

