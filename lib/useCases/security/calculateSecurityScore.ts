/**
 * Calculate Security Score
 *
 * Business logic for calculating security score from flags.
 */

import { SecurityFlag, CRITICAL_FLAGS } from "./types";

// Score reduction per non-critical flag
const SCORE_PENALTY_PER_FLAG = 15;
const MAX_SCORE = 100;
const MIN_SCORE = 0;

/**
 * Calculate security score based on active flags
 *
 * Rules:
 * - Base score is 100
 * - Each non-critical flag reduces score by 15 points
 * - Any critical flag results in score of 0
 *
 * @param flags - Array of active security flags
 * @returns Security score (0-100)
 */
export function calculateSecurityScore(flags: SecurityFlag[]): number {
  // Check for critical flags first
  const hasCriticalFlag = flags.some((f) =>
    CRITICAL_FLAGS.includes(f.flag)
  );

  if (hasCriticalFlag) {
    return MIN_SCORE;
  }

  // Calculate score based on flag count
  const penalty = flags.length * SCORE_PENALTY_PER_FLAG;
  return Math.max(MIN_SCORE, MAX_SCORE - penalty);
}
