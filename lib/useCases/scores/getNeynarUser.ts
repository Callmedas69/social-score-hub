/**
 * Get Neynar User Use Case
 *
 * Extracts Farcaster user data from Neynar API response.
 */

import { fetchNeynarUsers } from "@/lib/repositories/neynarRepository";
import { NeynarUserResult } from "./types";

/**
 * Get Farcaster user data for an address
 *
 * @param address - Ethereum address
 * @returns User data with FID and scores, or null values if not found
 */
export async function getNeynarUser(
  address: string
): Promise<{ user: NeynarUserResult | null; fid: number | null }> {
  const users = await fetchNeynarUsers(address);
  const user = users[0];

  if (!user) {
    return { user: null, fid: null };
  }

  return {
    user: {
      fid: user.fid ?? null,
      username: user.username ?? null,
      display_name: user.display_name ?? null,
      pfp_url: user.pfp_url ?? null,
      neynar_score: user.experimental?.neynar_user_score ?? null,
    },
    fid: user.fid ?? null,
  };
}
