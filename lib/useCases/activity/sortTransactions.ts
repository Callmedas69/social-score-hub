/**
 * Sort Transactions
 *
 * Sorts transactions by timestamp in descending order.
 */

import { AlchemyTransfer } from "./types";

/**
 * Sort transactions by timestamp (newest first)
 *
 * @param transfers - Array of transfers
 * @returns Sorted array (descending by timestamp)
 */
export function sortTransactionsByTime(
  transfers: AlchemyTransfer[]
): AlchemyTransfer[] {
  return [...transfers].sort((a, b) => {
    const timeA = new Date(a.metadata.blockTimestamp).getTime();
    const timeB = new Date(b.metadata.blockTimestamp).getTime();
    return timeB - timeA;
  });
}
