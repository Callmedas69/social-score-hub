import { useReadContract, useAccount } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";
import type { UserStats, FormattedUserStats } from "@/types";

export function useUserStats(chainId: SupportedChainId) {
  const { address, isConnected } = useAccount();
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getUserStats",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const stats: UserStats | null = data
    ? {
        firstCheckIn: data[0],
        lastCheckIn: data[1],
        totalCheckIns: data[2],
        currentStreak: data[3],
        longestStreak: data[4],
      }
    : null;

  const formatted: FormattedUserStats | null = stats
    ? {
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
      }
    : null;

  return {
    stats,
    formatted,
    isLoading,
    error,
    refetch,
  };
}
