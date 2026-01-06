/**
 * Calculate Activity Summary
 *
 * Computes derived statistics from transaction data.
 * This is presentation logic, computed server-side for efficiency.
 */

import { NormalizedTransaction } from "./types";

export interface ActivitySummary {
  totalTransactions: number;
  uniqueDaysActive: number;
  firstTxTimestamp: number | null;
  lastTxTimestamp: number | null;
  contractInteractions: number;
  activityPeriodDays: number;
  gasSpentWei: string; // Use string for bigint serialization
  totalVolumeWei: string; // Use string for bigint serialization
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * Calculate daily transaction counts
 */
export function calculateDailyCounts(
  transactions: NormalizedTransaction[]
): DailyCount[] {
  const counts = new Map<string, number>();

  for (const tx of transactions) {
    try {
      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
      counts.set(date, (counts.get(date) || 0) + 1);
    } catch {
      // Skip transactions with invalid timestamps
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

/**
 * Calculate activity summary statistics
 */
export function calculateActivitySummary(
  transactions: NormalizedTransaction[],
  address: string
): ActivitySummary {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      uniqueDaysActive: 0,
      firstTxTimestamp: null,
      lastTxTimestamp: null,
      contractInteractions: 0,
      activityPeriodDays: 0,
      gasSpentWei: "0",
      totalVolumeWei: "0",
    };
  }

  // Transactions are sorted desc, so last item is first tx
  const firstTx = transactions[transactions.length - 1];
  const lastTx = transactions[0];

  const firstTxDate = new Date(firstTx.timestamp * 1000);
  const lastTxDate = new Date(lastTx.timestamp * 1000);

  const activityPeriodDays =
    Math.ceil(
      (lastTxDate.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  // Count contract interactions
  const contractInteractions = transactions.filter(
    (tx) => tx.isContractInteraction
  ).length;

  // Get unique days
  const uniqueDays = new Set<string>();
  for (const tx of transactions) {
    try {
      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
      uniqueDays.add(date);
    } catch {
      // Skip invalid timestamps
    }
  }

  // Calculate gas spent (sum of gasUsed * effectiveGasPrice for outgoing txs)
  let gasSpentWei = 0n;
  for (const tx of transactions) {
    if (
      tx.from.toLowerCase() === address.toLowerCase() &&
      tx.gasUsed &&
      tx.effectiveGasPrice
    ) {
      const gasUsed = BigInt(tx.gasUsed);
      const gasPrice = BigInt(tx.effectiveGasPrice);
      gasSpentWei += gasUsed * gasPrice;
    }
  }

  // Calculate total volume (sum of outgoing native ETH transfers)
  let totalVolumeWei = 0n;
  for (const tx of transactions) {
    if (
      tx.from.toLowerCase() === address.toLowerCase() &&
      !tx.isContractInteraction &&
      tx.value
    ) {
      const valueNum = parseFloat(tx.value);
      if (!isNaN(valueNum) && valueNum > 0) {
        // Convert ETH to wei (multiply by 1e18)
        const valueWei = BigInt(Math.floor(valueNum * 1e18));
        totalVolumeWei += valueWei;
      }
    }
  }

  return {
    totalTransactions: transactions.length,
    uniqueDaysActive: uniqueDays.size,
    firstTxTimestamp: firstTx.timestamp,
    lastTxTimestamp: lastTx.timestamp,
    contractInteractions,
    activityPeriodDays,
    gasSpentWei: gasSpentWei.toString(),
    totalVolumeWei: totalVolumeWei.toString(),
  };
}
