import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

delete process.env.DATABASE_URL;
const { keywordQuery, scrub, fuseRanks, contentHash } = await import('../src/services/KnowledgeService.js');

describe('KnowledgeService helpers', () => {
  it('keywordQuery drops stopwords, dedupes and only emits safe tsquery tokens', () => {
    const q = keywordQuery("Write me a cold email to a SaaS founder -- DROP TABLE users; about our SaaS tool!!");
    expect(q).toBe('cold | email | saas | founder | drop | table | users | our | tool'.replace(' | our', ''));
    expect(q).not.toMatch(/[;'"!()&:]/);
    expect(keywordQuery('a an the')).toBe('');
  });

  it('scrub removes emails, phones, links, long numbers and api keys', () => {
    const out = scrub('Mail jane.doe@acme.com or call +1 (415) 555-0199, see https://acme.com/x?y=1, acct 1234567890123, key sk-abcdefghijklmnop1234');
    expect(out).not.toMatch(/jane\.doe|555-0199|acme\.com\/x|1234567890123|sk-abcdef/);
    expect(out).toContain('[EMAIL]');
    expect(out).toContain('[PHONE]');
    expect(out).toContain('[URL]');
    expect(out).toContain('[SECRET]');
  });

  it('fuseRanks rewards items that rank well in several lists', () => {
    const fused = fuseRanks([['a', 'b', 'c'], ['b', 'a'], ['b']]);
    expect(fused[0].id).toBe('b');
    expect(fused.map(f => f.id)).toEqual(['b', 'a', 'c']);
  });

  it('contentHash is stable and case-insensitive on the request', () => {
    expect(contentHash('Cold Email', 'P')).toBe(contentHash('  cold email ', 'P'));
    expect(contentHash('x', 'P1')).not.toBe(contentHash('x', 'P2'));
  });
});

describe('seed exemplars', () => {
  const seeds = JSON.parse(readFileSync(new URL('../seeds/exemplars.json', import.meta.url), 'utf8'));
  const templateCount = readdirSync(new URL('../templates', import.meta.url)).filter(f => f.endsWith('.md')).length;

  it('cover every template domain exactly once', () => {
    expect(seeds).toHaveLength(templateCount);
    expect(new Set(seeds.map(s => s.domain)).size).toBe(templateCount);
  });

  it('are substantial, structured and free of personal data', () => {
    for (const s of seeds) {
      expect(s.request.length).toBeGreaterThan(10);
      expect(s.prompt.split(/\s+/).length).toBeGreaterThan(90);
      expect(s.prompt).toMatch(/ROLE|TASK/);
      expect(scrub(s.prompt)).toBe(s.prompt);
    }
  });
});
