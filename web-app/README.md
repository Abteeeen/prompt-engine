# Prompt Engine

Turn a rough idea into a complete, scored prompt. An analyst model extracts the goal,
audience, constraints and the questions it would have asked; a drafter writes the prompt;
a critic scores it on ten criteria and rewrites it until it clears the bar. Signed-in users
get a library with versions, run history, and a business profile that is injected into
every generation.

```
web-app/
  backend/    Express API (Node 20), Postgres via Supabase, free-tier LLM provider hopping
  frontend/   Vite + React + TypeScript single-page app
```

## Run locally

```bash
# 1. Database (any Postgres works; Supabase for production)
#    Migrations run automatically when the API boots.

# 2. API
cd web-app/backend
cp .env.example .env            # fill DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID and at least one *_API_KEY
npm ci
npm run dev                     # http://localhost:3001  (health: /health)

# 3. Web
cd web-app/frontend
cp .env.example .env            # VITE_API_URL=http://localhost:3001, VITE_GOOGLE_CLIENT_ID=<same id as backend>
npm ci
npm run dev                     # http://localhost:5173
```

Tests: `cd web-app/backend && npm test`.

## Deploy

### Database: Supabase

1. Create a project. Project Settings → Database → Connection string → URI, **Transaction** pooler (port 6543).
2. Put it in `DATABASE_URL`. The API applies `backend/migrations/*.sql` on boot and records them in
   `schema_migrations`; it never drops tables. Old tables from the previous schema are left in place.
3. Free tier pauses after a week with no traffic. Daily users prevent that; a daily uptime ping to
   `/health` is a cheap insurance policy.

### Google sign-in

Google Cloud Console → APIs & Services → Credentials → Create OAuth client (Web application).
Add your frontend origin to "Authorised JavaScript origins". Use the client id as
`GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend).

### API hosting

Any Node 20 host works. `backend/Dockerfile` is included. Required environment in production:

| Variable | Purpose |
|---|---|
| `NODE_ENV=production` | enables strict startup checks |
| `DATABASE_URL` | Supabase connection string |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | OAuth client id |
| `FRONTEND_URL` | comma-separated allowed browser origins, e.g. `https://yourdomain.com` |
| at least one `*_API_KEY` | see `.env.example` for the provider list and free-tier notes |

Optional: `ADMIN_EMAILS`, `QUOTA_*_PER_DAY`, `LLM_PROVIDER_ORDER`, `LLM_DAILY_LIMITS`, `LLM_STATE_FILE`.

Notes on free hosting (verified October 2026): Vercel's Hobby plan is non-commercial only, so
the frontend cannot stay there once you charge. Render's free tier sleeps after 15 minutes and is
documented as not for production. Cloudflare Workers (API, via `httpServerHandler`) plus
Cloudflare Pages (frontend) is the free combination that allows commercial use and does not sleep.

### Frontend hosting

Static build: `npm run build` → `dist/`. Set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` at build time.
`vercel.json` carries the SPA rewrite and cache headers; equivalent settings exist for Cloudflare Pages
(`_redirects`: `/* /index.html 200`).

## Free-tier model hopping

Every provider in `backend/src/services/llm/providers.js` speaks the OpenAI chat format. Keys rotate,
exhausted keys cool down (per-minute, daily, credits, dead), and the next provider in
`LLM_PROVIDER_ORDER` takes over. One account per provider; hop across providers, never across
accounts on the same provider. `GET /api/ai/providers` (admin) shows live state.

## The knowledge base (how results get better over time)

Every generation retrieves up to two proven prompts and shows them to the drafter as models
of specificity and structure:

1. **Curated seeds**: 30 hand-written expert prompts, one per template domain
   (`backend/seeds/exemplars.py` → `exemplars.json`), loaded on every boot.
2. **Proven user prompts**: a generation joins the shared pool only when someone copies it,
   opens it in ChatGPT/Claude, saves it or marks it helpful, **and** the critic scored it at least
   `RAG_PROMOTE_MIN_SCORE` (26/30). Emails, phone numbers, links and long numbers are scrubbed
   first. "Not helpful" demotes it. Users can opt out in Settings, which also withdraws past
   contributions.
3. **The user's own best**: their top-rated or favourite library prompts, private to them.

Retrieval fuses Postgres full-text search (always on, free) with vector search when pgvector is
available (Supabase has it) and an embedding provider is configured (Cloudflare `bge-m3`
recommended, Gemini, or any OpenAI-compatible endpoint). Without one, keyword search is used.

Measure it: `npm run eval` runs ten fixed requests with and without retrieval and compares the
critic's scores. Curate it: `GET/POST/PATCH /api/admin/knowledge/exemplars` (admin only), and
`GET /api/admin/knowledge` shows pool size and average scores with and without examples.

## API

See `backend/src/app.js` for the route table. Errors are `{ error, code?, requestId }`.
Quota errors are `429` with `code: "QUOTA_EXCEEDED"` and a `usage` object.
