/**
 * GoPlus Security API Repository
 *
 * Handles data access to GoPlus Labs security API.
 * Returns raw API data - no business logic.
 */

import crypto from "crypto";
import { GoPlusRawResponse, RepositoryError } from "./types";

const GOPLUS_API_URL = "https://api.gopluslabs.io/api/v1";
const BASE_CHAIN_ID = "8453";

/**
 * Generate GoPlus authentication signature
 */
function generateGoPlusAuth(): { sign: string; time: string } {
  const appKey = process.env.GOPLUS_APP_KEY || "";
  const appSecret = process.env.GOPLUS_APP_SECRET || "";
  const time = Math.floor(Date.now() / 1000).toString();

  const signString = appKey + time + appSecret;
  const sign = crypto.createHash("sha1").update(signString).digest("hex");

  return { sign, time };
}

/**
 * Fetch wallet security data from GoPlus API
 *
 * @param address - Ethereum address to check
 * @returns Raw GoPlus response data or null if not found
 * @throws RepositoryError on API failure
 */
export async function fetchWalletSecurity(
  address: string
): Promise<Record<string, string> | null> {
  const appKey = process.env.GOPLUS_APP_KEY;
  let authParams = "";

  if (appKey) {
    const { sign, time } = generateGoPlusAuth();
    authParams = `&app_key=${appKey}&sign=${sign}&time=${time}`;
  }

  const response = await fetch(
    `${GOPLUS_API_URL}/address_security/${address}?chain_id=${BASE_CHAIN_ID}${authParams}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new RepositoryError(
      `GoPlus API error: ${response.status}`,
      response.status,
      "GoPlus"
    );
  }

  const data: GoPlusRawResponse = await response.json();

  // GoPlus returns code 1 for success, code 2 with empty result for new addresses
  if (data.code !== 1 && data.code !== 2) {
    console.error("GoPlus API response:", JSON.stringify(data));
    throw new RepositoryError(`GoPlus error: ${data.message}`, undefined, "GoPlus");
  }

  return data.result || null;
}
