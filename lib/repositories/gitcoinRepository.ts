/**
 * Gitcoin Passport API Repository
 *
 * Handles data access to Gitcoin Passport scores API.
 * Returns raw API data - no business logic.
 */

import { GitcoinRawResponse, RepositoryError } from "./types";

const GITCOIN_API_URL = "https://api.passport.xyz/v2/stamps";
const SCORER_ID = process.env.GITCOIN_PASSPORT_SCORER_ID || "11874";

/**
 * Fetch passport score from Gitcoin API
 *
 * @param address - Ethereum address
 * @returns Raw score data or null if not found
 * @throws RepositoryError on API failure
 */
export async function fetchGitcoinScore(
  address: string
): Promise<GitcoinRawResponse | null> {
  const apiKey = process.env.GITCOIN_PASSPORT_API_KEY;
  if (!apiKey) {
    throw new RepositoryError(
      "Gitcoin Passport API key not configured",
      500,
      "GitcoinPassport"
    );
  }

  const response = await fetch(
    `${GITCOIN_API_URL}/${SCORER_ID}/score/${address}`,
    {
      headers: {
        "X-API-KEY": apiKey,
      },
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new RepositoryError(
      `Gitcoin API error: ${response.status}`,
      response.status,
      "GitcoinPassport"
    );
  }

  const data = await response.json();
  return {
    score: data.score ?? null,
    passing_score: data.passing_score ?? false,
  };
}
