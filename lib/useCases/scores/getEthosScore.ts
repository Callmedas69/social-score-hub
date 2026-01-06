/**
 * Get Ethos Score Use Case
 *
 * Transforms Ethos Network reputation data.
 */

import { fetchEthosScore } from "@/lib/repositories/ethosRepository";
import { EthosScoreResult } from "./types";

/**
 * Get Ethos Network score for an address
 *
 * @param address - Ethereum address
 * @returns Ethos score and level or null if not found
 */
export async function getEthosScore(
  address: string
): Promise<EthosScoreResult | null> {
  const data = await fetchEthosScore(address);

  if (!data) {
    return null;
  }

  return {
    score: data.score,
    level: data.level,
  };
}
