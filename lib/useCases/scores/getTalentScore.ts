/**
 * Get Talent Score Use Case
 *
 * Extracts builder and creator scores from Talent Protocol data.
 */

import { fetchTalentScores } from "@/lib/repositories/talentRepository";
import { TalentScoreResult } from "./types";

/**
 * Get Talent Protocol scores for an address
 *
 * @param address - Ethereum address
 * @returns Talent scores or null if not found
 */
export async function getTalentScore(
  address: string
): Promise<TalentScoreResult | null> {
  const scores = await fetchTalentScores(address);

  if (!scores) {
    return null;
  }

  // Extract builder and creator scores from the array
  const builderScore = scores.find((s) => s.slug === "builder_score");
  const creatorScore = scores.find((s) => s.slug === "creator_score");

  return {
    builder_score: builderScore?.points ?? null,
    builder_rank: builderScore?.rank_position ?? null,
    creator_score: creatorScore?.points ?? null,
    creator_rank: creatorScore?.rank_position ?? null,
  };
}
