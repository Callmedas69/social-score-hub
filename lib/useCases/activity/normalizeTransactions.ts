/**
 * Normalize Transactions
 *
 * Transforms raw Alchemy transfers into normalized transaction format.
 */

import { AlchemyTransfer, NormalizedTransaction } from "./types";
import { TransactionReceipt } from "@/lib/repositories/types";

/**
 * Normalize raw transfers into standard transaction format
 *
 * @param transfers - Raw Alchemy transfers
 * @param receipts - Map of transaction receipts (hash -> receipt)
 * @returns Normalized transactions with gas info
 */
export function normalizeTransactions(
  transfers: AlchemyTransfer[],
  receipts: Map<string, TransactionReceipt>
): NormalizedTransaction[] {
  return transfers.map((tx) => {
    const receipt = receipts.get(tx.hash.toLowerCase());
    return {
      hash: tx.hash,
      timestamp: Math.floor(new Date(tx.metadata.blockTimestamp).getTime() / 1000),
      from: tx.from.toLowerCase(),
      to: tx.to?.toLowerCase() || null,
      value: tx.value?.toString() || "0",
      isError: false,
      isContractInteraction: tx.category !== "external",
      gasUsed: receipt?.gasUsed || null,
      effectiveGasPrice: receipt?.effectiveGasPrice || null,
    };
  });
}
