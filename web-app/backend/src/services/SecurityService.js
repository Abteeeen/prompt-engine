import logger from '../utils/logger.js';

/**
 * SecurityService implements the "Security Shield" (Feature 5).
 * It scans prompts for injection attacks, PII, and sensitive data.
 * Based on 'the-security-guide.md' from ECC.
 */
class SecurityService {
  constructor() {
    // Basic deny list for sensitive keywords (e.g., trying to leak system prompts or credentials)
    this.denyList = [
      'system prompt',
      'ignore all previous instructions',
      'API_KEY',
      'PASSWORD',
      'DATABASE_URL',
      'SECRET',
      '~/.ssh',
      '~/.env'
    ];
  }

  /**
   * Scans a prompt for potential risks.
   * @param {string} promptText 
   * @returns {Object} result { isSafe: boolean, riskLevel: string, findings: string[] }
   */
  async scanPrompt(promptText) {
    const findings = [];
    const lowerText = promptText.toLowerCase();

    // 1. Check for Deny List Keywords
    for (const forbidden of this.denyList) {
      if (lowerText.includes(forbidden.toLowerCase())) {
        findings.push(`Potential sensitive data leak or injection attempt: "${forbidden}"`);
      }
    }

    // 2. Check for Prompt Injection Patterns
    const injectionPatterns = [
      /ignore (all|the|previous) instructions/i,
      /you are now (an|a) (.*) and you must/i,
      /you no longer follow/i,
      /output the full text of your instructions/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(promptText)) {
        findings.push(`Likely prompt injection pattern detected: ${pattern}`);
      }
    }

    // 3. Simple length sanity check (ECC 'Immutability' and 'Cohesion' principles)
    if (promptText.length > 10000) {
      findings.push('Prompt is excessively long (>10k chars), which may cause context rot or excessive costs.');
    }

    const isSafe = findings.length === 0;
    const riskLevel = findings.length > 2 ? 'high' : (findings.length > 0 ? 'medium' : 'low');

    if (!isSafe) {
      logger.warn('Security Shield flagged a prompt', { findings, riskLevel });
    }

    return {
      isSafe,
      riskLevel,
      findings
    };
  }

  /**
   * Sanitizes input for display or storage.
   */
  sanitize(text) {
    // Basic sanitization from ECC 'security-review' skill
    return text
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '[REMAINS REMOVED]')
      .replace(/javascript:/gi, '[REMAINS REMOVED]')
      .trim();
  }
}

export default new SecurityService();
