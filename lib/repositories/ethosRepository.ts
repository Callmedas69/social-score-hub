/**
 * Ethos Network API Repository
 *
 * Handles data access to Ethos Network reputation API.
 * Returns raw API data - no business logic.
 */

import { EthosRawResponse, RepositoryError } from "./types";

const ETHOS_API_URL = "https://api.ethos.network/api/v2/score/address";

/**
 * Fetch reputation score from Ethos Network API
 *
 * @param address - Ethereum address
 * @returns Raw score and level data or null if not found
 * @throws RepositoryError on API failure
 */
export async function fetchEthosScore(
  address: string
): Promise<EthosRawResponse | null> {
  const response = await fetch(
    `${ETHOS_API_URL}?address=${address.toLowerCase()}`,
    {
      headers: {
        "X-Ethos-Client": "HelloOnchain",
      },
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new RepositoryError(
      `Ethos API error: ${response.status}`,
      response.status,
      "Ethos"
    );
  }

  const data = await response.json();
  return {
    score: data.score ?? null,
    level: data.level ?? null,
  };
}
