-- Migration 0002: knowledge base for retrieval-augmented generation.
--
-- exemplars  = proven prompts the drafter can learn from. Seeded with hand-written expert
--              examples; grows from user generations that earned a positive signal
--              (copied, opened in ChatGPT/Claude, saved, rated helpful) AND scored well.
-- Keyword search (Postgres full-text) always works. Vector search is added only when the
-- pgvector extension is available (it is on Supabase); otherwise the column is skipped and
-- retrieval falls back to keywords automatically.

CREATE TABLE IF NOT EXISTS exemplars (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source         VARCHAR(20) NOT NULL DEFAULT 'user',      -- seed | user | admin
  domain         VARCHAR(60),
  prompt_type    VARCHAR(30),
  request        TEXT NOT NULL,                             -- the rough idea (scrubbed)
  prompt         TEXT NOT NULL,                             -- the expert prompt (scrubbed)
  score          SMALLINT,                                  -- critic score 0-30
  signals        INTEGER NOT NULL DEFAULT 1,                -- net positive signals
  uses           INTEGER NOT NULL DEFAULT 0,                -- times retrieved into a generation
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  content_hash   TEXT NOT NULL UNIQUE,
  generation_id  UUID REFERENCES generations(id) ON DELETE SET NULL,
  embed_model    VARCHAR(80),
  tsv            TSVECTOR GENERATED ALWAYS AS (
                   setweight(to_tsvector('english', coalesce(request, '')), 'A') ||
                   setweight(to_tsvector('english', coalesce(domain, '')), 'B') ||
                   setweight(to_tsvector('english', left(coalesce(prompt, ''), 4000)), 'C')
                 ) STORED,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exemplars_tsv    ON exemplars USING GIN (tsv);
CREATE INDEX IF NOT EXISTS idx_exemplars_domain ON exemplars(domain) WHERE active;

-- Feedback on individual generations (guests included, keyed by session).
ALTER TABLE generations ADD COLUMN IF NOT EXISTS feedback   SMALLINT;      -- -1 | 1
ALTER TABLE generations ADD COLUMN IF NOT EXISTS copied     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS promoted   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS exemplars_used SMALLINT DEFAULT 0;

-- Users can opt out of contributing anonymised prompts to the shared knowledge base.
ALTER TABLE users ADD COLUMN IF NOT EXISTS share_examples BOOLEAN NOT NULL DEFAULT TRUE;

-- Optional vector search.
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector not available (%); keyword retrieval only', SQLERRM;
  END;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    -- Untyped vector: the embedding model may change; rows are only compared within one embed_model.
    EXECUTE 'ALTER TABLE exemplars ADD COLUMN IF NOT EXISTS embedding vector';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_exemplars_updated') THEN
    CREATE TRIGGER trg_exemplars_updated BEFORE UPDATE ON exemplars FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
