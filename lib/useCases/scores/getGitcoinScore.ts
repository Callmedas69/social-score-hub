/**
 * Get Gitcoin Score Use Case
 *
 * Parses Gitcoin Passport score with threshold logic.
 */

import { fetchGitcoinScore } from "@/lib/repositories/gitcoinRepository";
import { GitcoinScoreResult } from "./types";

// Default threshold for passing score
const DEFAULT_THRESHOLD = 20;

/**
 * Get Gitcoin Passport score for an address
 *
 * @param address - Ethereum address
 * @returns Gitcoin score with threshold or null if not found
 */
export async function getGitcoinScore(
  address: string
): Promise<GitcoinScoreResult | null> {
  const data = await fetchGitcoinScore(address);

  if (!data) {
    return null;
  }

  return {
    score: data.score ? parseFloat(data.score) : null,
    passing_score: data.passing_score ?? false,
    threshold: DEFAULT_THRESHOLD,
  };
}
