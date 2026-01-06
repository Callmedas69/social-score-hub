/**
 * Talent Protocol API Repository
 *
 * Handles data access to Talent Protocol scores API.
 * Returns raw API data - no business logic.
 */

import { TalentScoreRaw, RepositoryError } from "./types";

const TALENT_SCORES_URL = "https://api.talentprotocol.com/scores";

/**
 * Fetch scores from Talent Protocol API
 *
 * @param address - Ethereum address
 * @returns Array of raw score data or null if not found
 * @throws RepositoryError on API failure
 */
export async function fetchTalentScores(
  address: string
): Promise<TalentScoreRaw[] | null> {
  const apiKey = process.env.TALENT_PROTOCOL_API_KEY;
  if (!apiKey) {
    throw new RepositoryError(
      "Talent Protocol API key not configured",
      500,
      "TalentProtocol"
    );
  }

  const response = await fetch(
    `${TALENT_SCORES_URL}?id=${address.toLowerCase()}`,
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
      `Talent API error: ${response.status}`,
      response.status,
      "TalentProtocol"
    );
  }

  const data = await response.json();
  return data.scores || [];
}
