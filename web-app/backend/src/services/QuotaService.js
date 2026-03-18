import { query } from '../models/database.js';

const GUEST_DAILY_LIMIT = 15;

/**
 * Checks how many prompts the user/guest has generated today.
 * Returns an object with { allowed, remaining, totalUsed }.
 */
export async function checkGenerationQuota(req) {
  // Logged-in users bypass the strict 15-try limit, or have their own higher limit.
  if (req.user) {
    return { allowed: true, remaining: 'Unlimited', totalUsed: 0 };
  }

  // Identify guest uniquely, preferring IP but falling back to session ID.
  const ipAddress = req.ip || req.connection.remoteAddress;
  const sessionId = req.headers['x-session-id'];

  try {
    // Count how many generations this IP/Session has done today
    let sql = `
      SELECT COUNT(*) as usage_count 
      FROM analytics_events 
      WHERE event_type = 'prompt_generated' 
      AND created_at >= CURRENT_DATE
    `;
    const params = [];

    if (ipAddress) {
      sql += ` AND ip_address = $1`;
      params.push(ipAddress);
    } else if (sessionId) {
      sql += ` AND session_id = $1`;
      params.push(sessionId);
    } else {
      // If we can't identify them at all, be safe and allow (rare edge case)
      return { allowed: true, remaining: 1, totalUsed: 0 };
    }

    const result = await query(sql, params);
    const totalUsed = parseInt(result.rows[0].usage_count, 10) || 0;
    const remaining = Math.max(0, GUEST_DAILY_LIMIT - totalUsed);

    return {
      allowed: remaining > 0,
      remaining,
      totalUsed,
      limit: GUEST_DAILY_LIMIT
    };
  } catch (err) {
    console.error('Error checking quota:', err);
    // Fail open if db drops so we don't break the app
    return { allowed: true, remaining: 1, totalUsed: 0 };
  }
}
