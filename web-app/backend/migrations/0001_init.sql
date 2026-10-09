-- Prompt Engine schema, migration 0001.
-- Replaces the old schema.sql / setup_db.js / fix_db.js trio with one versioned source of truth.
-- Safe to run on an existing Supabase project: every statement is IF NOT EXISTS, and the old
-- tables (templates, user_prompts, learned_patterns, arena_comparisons, gold_standard_prompts)
-- are left untouched so nothing is lost; drop them by hand once you have verified the new app.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE,
  github_id     VARCHAR(100) UNIQUE,              -- legacy column, no longer written
  google_sub    VARCHAR(100) UNIQUE,              -- Google account id (stable across email changes)
  name          VARCHAR(255),
  avatar_url    TEXT,
  subscription  VARCHAR(50) DEFAULT 'free',       -- legacy name kept; see plan below
  plan          VARCHAR(20) NOT NULL DEFAULT 'free',   -- free | pro
  role          VARCHAR(20) NOT NULL DEFAULT 'user',   -- user | admin
  preferences   JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub   VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan         VARCHAR(20) NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role         VARCHAR(20) NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

-- ── Business context (the memory that makes the next prompt better) ──────────
CREATE TABLE IF NOT EXISTS context_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(120) NOT NULL DEFAULT 'Default',
  is_default    BOOLEAN NOT NULL DEFAULT TRUE,
  brand_voice   TEXT NOT NULL DEFAULT '',
  product_facts TEXT NOT NULL DEFAULT '',
  audience      TEXT NOT NULL DEFAULT '',
  constraints   TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_context_profiles_default ON context_profiles(user_id) WHERE is_default;

-- ── Every pipeline run: history for the user, ledger for the founder ─────────
CREATE TABLE IF NOT EXISTS generations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,   -- NULL for guests
  session_id     VARCHAR(100),
  kind           VARCHAR(20) NOT NULL DEFAULT 'generate',       -- generate | refine | optimize | template
  request        TEXT NOT NULL,
  prompt         TEXT,
  domain         VARCHAR(60),
  prompt_type    VARCHAR(30),
  quality_score  SMALLINT,
  score_method   VARCHAR(20),
  analysis       JSONB,
  issues         JSONB,
  pipeline       JSONB,          -- ["groq:openai/gpt-oss-120b", ...]
  provider       VARCHAR(40),
  model          VARCHAR(120),
  refinements    SMALLINT DEFAULT 0,
  tokens_in      INTEGER,
  tokens_out     INTEGER,
  latency_ms     INTEGER,
  status         VARCHAR(20) NOT NULL DEFAULT 'ok',             -- ok | fallback | error
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_session_created ON generations(session_id, created_at DESC);

-- ── Library ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prompts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              VARCHAR(200) NOT NULL,
  domain             VARCHAR(60),
  tags               TEXT[] NOT NULL DEFAULT '{}',
  is_favorite        BOOLEAN NOT NULL DEFAULT FALSE,
  rating             SMALLINT,                    -- -1 | 0 | 1
  rating_reason      VARCHAR(60),
  current_version_id UUID,
  source_generation  UUID REFERENCES generations(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prompts_user_updated ON prompts(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id   UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version_no  INTEGER NOT NULL,
  body        TEXT NOT NULL,
  score       SMALLINT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (prompt_id, version_no)
);

-- ── Usage counters (quota). One row per actor per UTC day. ───────────────────
CREATE TABLE IF NOT EXISTS usage_daily (
  actor_key   VARCHAR(140) NOT NULL,              -- 'user:<uuid>' or 'session:<id>' or 'ip:<addr>'
  day         DATE NOT NULL,
  generations INTEGER NOT NULL DEFAULT 0,
  tokens      BIGINT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (actor_key, day)
);

-- ── Feedback ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id  VARCHAR(100),
  email       VARCHAR(255),
  page        VARCHAR(200),
  rating      SMALLINT,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Analytics (whitelisted events, small metadata) ───────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   VARCHAR(100) NOT NULL,
  template_id  VARCHAR(60),
  user_id      UUID,
  session_id   VARCHAR(100),
  quality_score INTEGER,
  metadata     JSONB DEFAULT '{}',
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type   ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at   ON analytics_events(created_at DESC);

-- ── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prompts_updated') THEN
    CREATE TRIGGER trg_prompts_updated BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated') THEN
    CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON context_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
