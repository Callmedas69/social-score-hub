/**
 * Determine Risk Level
 *
 * Business logic for determining risk level from flags.
 */

import { SecurityFlag, RiskLevel, CRITICAL_FLAGS } from "./types";

/**
 * Determine risk level based on active security flags
 *
 * Rules:
 * - No flags = "clean"
 * - Any critical flag = "critical"
 * - 3+ flags = "high"
 * - 1-2 flags = "medium"
 * - Edge case default = "low"
 *
 * @param flags - Array of active security flags
 * @returns Risk level classification
 */
export function determineRiskLevel(flags: SecurityFlag[]): RiskLevel {
  if (flags.length === 0) {
    return "clean";
  }

  // Check for critical flags
  const hasCriticalFlag = flags.some((f) =>
    CRITICAL_FLAGS.includes(f.flag)
  );

  if (hasCriticalFlag) {
    return "critical";
  }

  // Determine by flag count
  if (flags.length >= 3) {
    return "high";
  }

  if (flags.length >= 1) {
    return "medium";
  }

  return "low";
}
