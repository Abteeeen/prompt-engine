import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const baselinePrompts = [
  {
    user_idea: "write a blog post about artificial intelligence",
    perfect_prompt: "ROLE: You are an expert tech blogger. TASK: Write a 1,000-word SEO-optimized blog post about the history and future of AI. REQUIREMENTS: - Use engaging, accessible language. - Include 3 real-world examples. - End with a call to action.",
    domain: "content-writing"
  },
  {
    user_idea: "explain quantum physics to a child",
    perfect_prompt: "ROLE: You are a friendly science teacher. TASK: Explain quantum physics using simple analogies. REQUIREMENTS: - Target audience: 10-year-olds. - Use an analogy involving toys or everyday objects. - Do not use complex jargon. - Keep it under 300 words.",
    domain: "teaching-explanation"
  },
  {
    user_idea: "create a weekly meal plan",
    perfect_prompt: "ROLE: You are a professional nutritionist. TASK: Create a 7-day healthy meal plan for a busy professional. REQUIREMENTS: - Include breakfast, lunch, dinner, and one snack per day. - Ensure meals take less than 30 minutes to prep. - Include a categorized grocery shopping list at the end.",
    domain: "planning"
  },
  {
    user_idea: "debug my slow python code",
    perfect_prompt: "ROLE: You are a Senior Python Developer and Performance Expert. TASK: Analyze the provided Python snippet for performance bottlenecks. REQUIREMENTS: - Identify the root cause of the slowdown. - Provide an optimized version of the code. - Explain the time and space complexity improvements.",
    domain: "code-generation"
  },
  {
    user_idea: "write a cold email to an investor",
    perfect_prompt: "ROLE: You are a successful startup founder raising a Seed round. TASK: Write a cold email to a top-tier venture capitalist. REQUIREMENTS: - Must be highly concise (under 150 words). - State the problem, solution, and traction in bullet points. - Ask for a specific 15-minute call time. - Tone: Confident and respectful.",
    domain: "email-writing"
  }
];

async function seed() {
  console.log('Loading embedding model...');
  // Use a small text embedding model that works natively in Node
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  for (const item of baselinePrompts) {
    console.log(`Processing prompt: ${item.user_idea}`);
    try {
      // Create embedding of the user idea
      const output = await extractor(item.user_idea, { pooling: 'mean', normalize: true });
      const embeddingArray = Array.from(output.data);
      
      const { data, error } = await supabase.from('gold_standard_prompts').insert([
        {
          user_idea: item.user_idea,
          perfect_prompt: item.perfect_prompt,
          domain: item.domain,
          embedding: embeddingArray
        }
      ]);

      if (error) {
        console.error('Error inserting:', error);
      } else {
        console.log(`Inserted successfully!`);
      }
    } catch (err) {
      console.error('Failed to embed/insert:', err);
    }
  }

  console.log('Seeding complete!');
}

seed();
