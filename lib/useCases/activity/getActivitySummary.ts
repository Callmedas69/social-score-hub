/**
 * Get Activity Summary Use Case
 *
 * Orchestrates the activity fetching workflow:
 * 1. Fetches incoming and outgoing transfers
 * 2. Deduplicates by hash
 * 3. Sorts by timestamp
 * 4. Fetches receipts for outgoing transactions
 * 5. Normalizes transaction data
 * 6. Calculates summary statistics
 */

import {
  fetchAssetTransfers,
  fetchTransactionReceipts,
} from "@/lib/repositories/alchemyRepository";
import { ActivitySummaryResult, NormalizedTransaction } from "./types";
import { deduplicateTransactions } from "./deduplicateTransactions";
import { sortTransactionsByTime } from "./sortTransactions";
import { normalizeTransactions } from "./normalizeTransactions";
import {
  calculateDailyCounts,
  calculateActivitySummary,
  ActivitySummary,
  DailyCount,
} from "./calculateActivitySummary";

const RECEIPT_BATCH_SIZE = 100;

export interface ActivityResult {
  transactions: NormalizedTransaction[];
  summary: ActivitySummary;
  dailyCounts: DailyCount[];
}

/**
 * Get complete activity data for an address
 *
 * @param address - Ethereum address
 * @returns Activity data with transactions, summary, and daily counts
 */
export async function getActivitySummary(
  address: string
): Promise<ActivityResult> {
  // Fetch all transfers (incoming and outgoing) in parallel
  const [outgoing, incoming] = await Promise.all([
    fetchAssetTransfers(address, "from"),
    fetchAssetTransfers(address, "to"),
  ]);

  // Combine and deduplicate
  const combined = [...outgoing, ...incoming];
  const unique = deduplicateTransactions(combined);

  // Sort by timestamp (newest first)
  const sorted = sortTransactionsByTime(unique);

  // Get outgoing transaction hashes (need gas data for these)
  const outgoingHashes = sorted
    .filter((tx) => tx.from.toLowerCase() === address.toLowerCase())
    .map((tx) => tx.hash);

  // Fetch receipts in batches
  const allReceipts = new Map<string, { gasUsed: string; effectiveGasPrice: string }>();

  for (let i = 0; i < outgoingHashes.length; i += RECEIPT_BATCH_SIZE) {
    const batch = outgoingHashes.slice(i, i + RECEIPT_BATCH_SIZE);
    const batchReceipts = await fetchTransactionReceipts(batch);
    for (const [hash, data] of batchReceipts) {
      allReceipts.set(hash, data);
    }
  }

  // Normalize transaction data
  const transactions = normalizeTransactions(sorted, allReceipts);

  // Calculate summary statistics
  const summary = calculateActivitySummary(transactions, address);
  const dailyCounts = calculateDailyCounts(transactions);

  return { transactions, summary, dailyCounts };
}
