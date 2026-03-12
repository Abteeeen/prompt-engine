import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.imxikcpfxghmujthaply:Nishaanil@10@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  const createTableQuery = `
    -- Enable pgvector extension
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Create prompts table
    CREATE TABLE IF NOT EXISTS gold_standard_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_idea TEXT NOT NULL,
      perfect_prompt TEXT NOT NULL,
      domain VARCHAR(100),
      embedding vector(1536),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create a function to search for prompts based on vector similarity
    CREATE OR REPLACE FUNCTION match_prompts (
      query_embedding vector(1536),
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
      SELECT
        gold_standard_prompts.id,
        gold_standard_prompts.user_idea,
        gold_standard_prompts.perfect_prompt,
        gold_standard_prompts.domain,
        1 - (gold_standard_prompts.embedding <=> query_embedding) AS similarity
      FROM gold_standard_prompts
      WHERE 1 - (gold_standard_prompts.embedding <=> query_embedding) > match_threshold
      ORDER BY similarity DESC
      LIMIT match_count;
    $$;
  `;

  try {
    await client.query(createTableQuery);
    console.log('Tables and vector functions created successfully!');
  } catch (err) {
    console.error('Error creating schema:', err);
  } finally {
    await client.end();
  }
}

run();
