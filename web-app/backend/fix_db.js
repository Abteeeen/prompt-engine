import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.imxikcpfxghmujthaply:Nishaanil@10@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

const client = new Client({ connectionString });

async function run() {
  await client.connect();
  console.log('Fixing vector dimensions...');

  const fixQuery = `
    DROP FUNCTION IF EXISTS match_prompts;
    DROP TABLE IF EXISTS gold_standard_prompts;

    CREATE TABLE IF NOT EXISTS gold_standard_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_idea TEXT NOT NULL,
      perfect_prompt TEXT NOT NULL,
      domain VARCHAR(100),
      embedding vector(384),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION match_prompts (
      query_embedding vector(384),
      match_threshold float,
      match_count int
    )
    RETURNS TABLE (
      id UUID,
      user_idea TEXT,
      perfect_prompt TEXT,
      domain VARCHAR(100),
      similarity float
    )
    LANGUAGE SQL STABLE
    AS $$
      SELECT id, user_idea, perfect_prompt, domain, 1 - (embedding <=> query_embedding) AS similarity
      FROM gold_standard_prompts
      WHERE 1 - (embedding <=> query_embedding) > match_threshold
      ORDER BY similarity DESC
      LIMIT match_count;
    $$;
  `;

  try {
    await client.query(fixQuery);
    console.log('Fixed successfully!');
  } catch (err) {
    console.error('Error fixing:', err);
  } finally {
    await client.end();
  }
}

run();
