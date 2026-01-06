/**
 * Neynar Farcaster API Repository
 *
 * Handles data access to Neynar's Farcaster user API.
 * Returns raw API data - no business logic.
 */

import { NeynarUserRaw, RepositoryError } from "./types";

const NEYNAR_API_URL = "https://api.neynar.com/v2/farcaster/user/bulk-by-address";

/**
 * Fetch Farcaster user data by address from Neynar API
 *
 * @param address - Ethereum address
 * @returns Array of raw user data or empty array if not found
 * @throws RepositoryError on API failure
 */
export async function fetchNeynarUsers(
  address: string
): Promise<NeynarUserRaw[]> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    throw new RepositoryError(
      "Neynar API key not configured",
      500,
      "Neynar"
    );
  }

  const response = await fetch(
    `${NEYNAR_API_URL}?addresses=${address.toLowerCase()}`,
    {
      headers: {
        "x-api-key": apiKey,
        "x-neynar-experimental": "true",
      },
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new RepositoryError(
      `Neynar API error: ${response.status}`,
      response.status,
      "Neynar"
    );
  }

  const data = await response.json();

  // Neynar returns data keyed by address, flatten to array
  const users = Object.values(data || {}).flat() as NeynarUserRaw[];
  return users;
}
