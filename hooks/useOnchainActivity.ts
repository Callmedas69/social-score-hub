"use client";

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

interface ActivityApiResponse {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    uniqueDaysActive: number;
    firstTxTimestamp: number | null;
    lastTxTimestamp: number | null;
    contractInteractions: number;
    activityPeriodDays: number;
    gasSpentWei: string;
    totalVolumeWei: string;
  };
  dailyCounts: DailyCount[];
}

async function fetchActivity(address: string): Promise<ActivityApiResponse> {
  const response = await fetch(`/api/activity/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }
  return response.json();
}

export function useOnchainActivity() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["onchain-activity", address],
    queryFn: () => fetchActivity(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform server response to client format
  const summary = useMemo<ActivitySummary>(() => {
    if (!data?.summary) {
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

    const s = data.summary;
    return {
      totalTransactions: s.totalTransactions,
      uniqueDaysActive: s.uniqueDaysActive,
      firstTxDate: s.firstTxTimestamp ? new Date(s.firstTxTimestamp * 1000) : null,
      lastTxDate: s.lastTxTimestamp ? new Date(s.lastTxTimestamp * 1000) : null,
      contractInteractions: s.contractInteractions,
      activityPeriodDays: s.activityPeriodDays,
      gasSpentWei: BigInt(s.gasSpentWei || "0"),
      totalVolumeWei: BigInt(s.totalVolumeWei || "0"),
    };
  }, [data?.summary]);

  return {
    transactions: data?.transactions || [],
    dailyCounts: data?.dailyCounts || [],
    summary,
    isLoading,
    error,
    refetch,
  };
}
