import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string | null;
  value: string;
  isError: boolean;
  isContractInteraction: boolean;
  gasUsed: string | null;
  effectiveGasPrice: string | null;
}

export interface ActivitySummary {
  totalTransactions: number;
  uniqueDaysActive: number;
  firstTxDate: Date | null;
  lastTxDate: Date | null;
  contractInteractions: number;
  activityPeriodDays: number;
  gasSpentWei: bigint;
  totalVolumeWei: bigint;
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

async function fetchActivity(address: string): Promise<Transaction[]> {
  const response = await fetch(`/api/activity/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }
  const data = await response.json();
  return data.transactions || [];
}

function calculateDailyCounts(transactions: Transaction[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const tx of transactions) {
    try {
      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
      counts.set(date, (counts.get(date) || 0) + 1);
    } catch {
      // Skip transactions with invalid timestamps
    }
  }

  return counts;
}

function calculateSummary(
  transactions: Transaction[],
  dailyCounts: Map<string, number>,
  address: string
): ActivitySummary {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      uniqueDaysActive: 0,
      firstTxDate: null,
      lastTxDate: null,
      contractInteractions: 0,
      activityPeriodDays: 0,
      gasSpentWei: 0n,
      totalVolumeWei: 0n,
    };
  }

  // Transactions are sorted desc, so last item is first tx
  const firstTx = transactions[transactions.length - 1];
  const lastTx = transactions[0];

  const firstTxDate = new Date(firstTx.timestamp * 1000);
  const lastTxDate = new Date(lastTx.timestamp * 1000);

  const activityPeriodDays = Math.ceil(
    (lastTxDate.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const contractInteractions = transactions.filter(
    (tx) => tx.isContractInteraction
  ).length;

  // Calculate gas spent (sum of gasUsed * effectiveGasPrice for outgoing txs)
  let gasSpentWei = 0n;
  for (const tx of transactions) {
    if (tx.from.toLowerCase() === address.toLowerCase() && tx.gasUsed && tx.effectiveGasPrice) {
      const gasUsed = BigInt(tx.gasUsed);
      const gasPrice = BigInt(tx.effectiveGasPrice);
      gasSpentWei += gasUsed * gasPrice;
    }
  }

  // Calculate total volume (sum of outgoing NATIVE ETH transfers only)
  // isContractInteraction=false means external ETH transfer (not ERC20)
  // value from Alchemy is already in ETH decimal format
  let totalVolumeWei = 0n;
  for (const tx of transactions) {
    if (
      tx.from.toLowerCase() === address.toLowerCase() &&
      !tx.isContractInteraction && // Only native ETH transfers
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
    uniqueDaysActive: dailyCounts.size,
    firstTxDate,
    lastTxDate,
    contractInteractions,
    activityPeriodDays,
    gasSpentWei,
    totalVolumeWei,
  };
}

export function useOnchainActivity() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["onchain-activity", address],
    queryFn: () => fetchActivity(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const transactions = data || [];

  const dailyCounts = useMemo(
    () => calculateDailyCounts(transactions),
    [transactions]
  );

  const summary = useMemo(
    () =>
      address
        ? calculateSummary(transactions, dailyCounts, address)
        : {
            totalTransactions: 0,
            uniqueDaysActive: 0,
            firstTxDate: null,
            lastTxDate: null,
            contractInteractions: 0,
            activityPeriodDays: 0,
            gasSpentWei: 0n,
            totalVolumeWei: 0n,
          },
    [transactions, dailyCounts, address]
  );

  // Convert Map to array for heatmap
  const dailyCountsArray = useMemo<DailyCount[]>(
    () => Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count })),
    [dailyCounts]
  );

  return {
    transactions,
    dailyCounts: dailyCountsArray,
    summary,
    isLoading,
    error,
    refetch,
  };
}
