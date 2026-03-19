import logger from '../utils/logger.js';
import { createClient } from '@supabase/supabase-js';
import { callAIResilient } from './AIService.js'; // need to export this or move to utils

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

/**
 * LearningService implements the "Continuous Learning" (Feature 2).
 * It extracts reusable patterns from successful generations.
 */
class LearningService {
  /**
   * Analyzes a successful generation to extract patterns.
   * @param {string} userIdea 
   * @param {string} perfectPrompt 
   * @param {number} qualityScore 
   * @param {UUID} userId 
   */
  async learnFromSuccess(userIdea, perfectPrompt, qualityScore, userId = null) {
    if (qualityScore < 25) return; // Only learn from high-quality results

    logger.info('Learning from successful generation', { qualityScore });

    try {
      // Use Haiku (fast/cheap) as the "Observer" agent
      const observerPrompt = `You are a Meta-Prompt Learning Agent.
Analyze the following successful prompt engineering accomplishment:
User Idea: "${userIdea}"
Expert Prompt: "${perfectPrompt}"

Identify 1-2 reusable "Patterns" or "Instincts" that made this prompt effective.
Focus on: Specificity, Role Definition, Structure, or Constraint handling.
Output: A JSON array of { category: string, pattern_text: string, confidence: float }.`;

      const analysis = await callAIResilient(observerPrompt, 'Extract patterns.', 'openrouter', 'anthropic/claude-3-haiku:free');
      const content = analysis.choices?.[0]?.message?.content?.trim();
      
      // Parse JSON from content (wrapped in markdown or raw)
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        const patterns = JSON.parse(jsonMatch[0]);
        
        for (const pattern of patterns) {
          await supabase.from('learned_patterns').insert([{
            user_id: userId,
            category: pattern.category,
            pattern_text: pattern.pattern_text,
            confidence: pattern.confidence,
            metadata: { userIdea, qualityScore }
          }]);
        }
        
        logger.info('Learned new patterns successfully', { count: patterns.length });
      }
    } catch (err) {
      logger.warn('Continuous Learning cycle failed', { error: err.message });
    }
  }

  /**
   * Retrieves relevant patterns for a new prompt request.
   */
  async getRelevantContext(userIdea) {
    // In a full implementation, we'd use vector search here.
    // For now, return the most recent high-confidence patterns.
    const { data } = await supabase
      .from('learned_patterns')
      .select('*')
      .order('confidence', { ascending: false })
      .limit(3);
      
    return data || [];
  }
}

export default new LearningService();
