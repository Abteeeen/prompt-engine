/**
 * Quality evaluation: run a fixed set of requests through the real pipeline twice,
 * once WITHOUT retrieval and once WITH it, and compare the critic's rubric scores.
 *
 *   npm run eval                 # 10 requests, both modes
 *   npm run eval -- --limit 4    # fewer requests (each request costs ~4-6 model calls per mode)
 *
 * Needs DATABASE_URL (for the knowledge base) and at least one LLM provider key.
 * Results print as a table and are written to eval-results.json.
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { generateWithAI } from '../src/services/AIService.js';
import { retrieveContext, seedExemplars } from '../src/services/KnowledgeService.js';
import { configuredProviders } from '../src/services/llm/providers.js';
import { hasDatabase, closeDatabase } from '../src/models/database.js';
import { runMigrations } from '../src/models/migrate.js';

const REQUESTS = [
  'cold email to a CTO about our observability tool',
  'linkedin post about hiring our first designer',
  'explain kubernetes to a product manager',
  'write a function that validates IBAN numbers in typescript',
  'refund reply to a customer who was double charged',
  'youtube script about saving for a house deposit',
  'pitch deck narrative for a climate fintech raising seed',
  'study plan for the AWS solutions architect exam in 8 weeks',
  'job description for a customer success lead',
  'privacy policy for a fitness tracking app',
];

const limitArg = process.argv.indexOf('--limit');
const limit = limitArg > -1 ? parseInt(process.argv[limitArg + 1], 10) : REQUESTS.length;

if (!configuredProviders().length) {
  console.error('No LLM provider configured. Add at least one *_API_KEY to .env first.');
  process.exit(1);
}
if (hasDatabase) {
  await runMigrations({ log: { info() {} } });
  await seedExemplars();
} else {
  console.warn('DATABASE_URL not set: the "with retrieval" run will have no knowledge base to use.');
}

const rows = [];
for (const request of REQUESTS.slice(0, limit)) {
  const row = { request };
  for (const mode of ['without', 'with']) {
    const started = Date.now();
    try {
      const r = await generateWithAI(request, {
        retrieve: mode === 'with' ? ({ request: q, domain }) => retrieveContext({ request: q, domain }) : null,
      });
      row[mode] = { score: r.qualityScore?.overallScore ?? null, method: r.qualityScore?.method, examples: r.exemplarsUsed || 0, model: `${r.source}:${r.model}`, ms: Date.now() - started };
    } catch (err) {
      row[mode] = { error: err.message.slice(0, 120) };
    }
  }
  rows.push(row);
  const fmt = (x) => (x?.score != null ? `${x.score}/30${x.examples ? ` (${x.examples} ex)` : ''}` : (x?.error ? 'error' : '-'));
  console.log(`${fmt(row.without).padEnd(14)} ${fmt(row.with).padEnd(16)} ${request}`);
}

const avg = (mode) => {
  const s = rows.map(r => r[mode]?.score).filter(n => typeof n === 'number');
  return s.length ? (s.reduce((a, b) => a + b, 0) / s.length).toFixed(1) : 'n/a';
};
console.log(`\nAverage critic score without retrieval: ${avg('without')}   with retrieval: ${avg('with')}`);
console.log('Note: the critic is itself a model. Treat small differences as noise; look at the prompts in eval-results.json too.');
writeFileSync('eval-results.json', JSON.stringify(rows, null, 2));
await closeDatabase();
process.exit(0);
