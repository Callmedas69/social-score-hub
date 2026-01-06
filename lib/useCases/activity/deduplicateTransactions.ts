/**
 * Deduplicate Transactions
 *
 * Removes duplicate transactions based on hash.
 */

import { AlchemyTransfer } from "./types";

/**
 * Deduplicate transactions by hash
 *
 * @param transfers - Array of transfers (may contain duplicates from incoming/outgoing)
 * @returns Array of unique transfers
 */
export function deduplicateTransactions(
  transfers: AlchemyTransfer[]
): AlchemyTransfer[] {
  const seen = new Set<string>();
  const unique: AlchemyTransfer[] = [];

  for (const transfer of transfers) {
    if (!seen.has(transfer.hash)) {
      seen.add(transfer.hash);
      unique.push(transfer);
    }
  }

  return unique;
}
