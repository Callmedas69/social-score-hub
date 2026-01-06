/**
 * Get Quotient Scores Use Case
 *
 * Validates FIDs and fetches Quotient reputation scores.
 */

import { fetchQuotientScores } from "@/lib/repositories/quotientRepository";
import { QuotientScoreResult } from "./types";

// API limit for FIDs per request
const MAX_FIDS_PER_REQUEST = 1000;

/**
 * Validate that a value is a positive integer FID
 */
function isValidFid(fid: unknown): fid is number {
  return typeof fid === "number" && Number.isInteger(fid) && fid > 0;
}

/**
 * Get Quotient reputation scores for FIDs
 *
 * @param fids - Array of Farcaster IDs (will be validated)
 * @returns Quotient scores for valid FIDs
 * @throws Error if no valid FIDs provided
 */
export async function getQuotientScores(
  fids: unknown[]
): Promise<QuotientScoreResult> {
  // Validate each FID is a positive integer
  const validFids = fids.filter(isValidFid);

  if (validFids.length === 0) {
    throw new Error("No valid FIDs provided");
  }

  // Limit to API maximum
  const limitedFids = validFids.slice(0, MAX_FIDS_PER_REQUEST);

  return fetchQuotientScores(limitedFids);
}
