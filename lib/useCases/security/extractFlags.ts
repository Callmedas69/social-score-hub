/**
 * Extract Security Flags
 *
 * Extracts active security flags from raw GoPlus API data.
 */

import { SecurityFlag, SECURITY_FLAGS, FLAG_LABELS } from "./types";

/**
 * Extract active flags from raw GoPlus response data
 *
 * @param rawData - Raw GoPlus API result object
 * @returns Array of active security flags with labels and severity
 */
export function extractFlags(rawData: Record<string, string>): SecurityFlag[] {
  const activeFlags: SecurityFlag[] = [];

  for (const flag of SECURITY_FLAGS) {
    if (rawData[flag] === "1") {
      const flagInfo = FLAG_LABELS[flag];
      if (flagInfo) {
        activeFlags.push({
          flag,
          label: flagInfo.label,
          severity: flagInfo.severity,
        });
      }
    }
  }

  return activeFlags;
}
