/**
 * Quotient API Repository
 *
 * Handles data access to Quotient's Farcaster reputation API.
 * Returns raw API data - no business logic.
 */

import { QuotientUserData, RepositoryError } from "./types";

const QUOTIENT_API_URL = "https://api.quotient.social/v1/user-reputation";

/**
 * Fetch reputation scores for FIDs from Quotient API
 *
 * @param fids - Array of Farcaster IDs
 * @returns Raw response with user data array and count
 * @throws RepositoryError on API failure
 */
export async function fetchQuotientScores(
  fids: number[]
): Promise<{ data: QuotientUserData[]; count: number }> {
  const apiKey = process.env.QUOTIENT_API_KEY;
  if (!apiKey) {
    throw new RepositoryError(
      "Quotient API key not configured",
      500,
      "Quotient"
    );
  }

  const response = await fetch(QUOTIENT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fids,
      api_key: apiKey,
    }),
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { data: [], count: 0 };
    }
    throw new RepositoryError(
      `Quotient API error: ${response.status}`,
      response.status,
      "Quotient"
    );
  }

  const data = await response.json();
  return {
    data: data.data || [],
    count: data.count || 0,
  };
}
