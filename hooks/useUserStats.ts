import { useMemo } from "react";
import { useReadContract, useAccount } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";
import type { UserStats, FormattedUserStats } from "@/types";

export function useUserStats(chainId: SupportedChainId) {
  const { address } = useAccount();
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    chainId,
    query: {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - matches contract check-in period
    },
  });

  const stats: UserStats | null = useMemo(() => {
    if (!data) return null;
    return {
      firstCheckIn: data[0],
      lastCheckIn: data[1],
      totalCheckIns: data[2],
      currentStreak: data[3],
      longestStreak: data[4],
    };
  }, [data]);

  const formatted: FormattedUserStats | null = useMemo(() => {
    if (!stats) return null;
    return {
      firstCheckIn:
        stats.firstCheckIn > 0n
          ? new Date(Number(stats.firstCheckIn) * 1000)
          : null,
      lastCheckIn:
        stats.lastCheckIn > 0n
          ? new Date(Number(stats.lastCheckIn) * 1000)
          : null,
      totalCheckIns: Number(stats.totalCheckIns),
      currentStreak: Number(stats.currentStreak),
      longestStreak: Number(stats.longestStreak),
    };
  }, [stats]);

  return {
    stats,
    formatted,
    isLoading,
    error,
    refetch,
  };
}
