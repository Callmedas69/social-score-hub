import { useReadContract } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";

export interface DailyClaimStats {
  cap: bigint;
  claimed: bigint;
  remaining: bigint;
  isCapReached: boolean;
  isUnlimited: boolean;
}

export function useDailyClaimStats(chainId: SupportedChainId) {
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getDailyClaimStats",
    chainId,
    query: {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - matches contract check-in period
    },
  });

  const stats: DailyClaimStats | null = data
    ? {
        cap: data[0],
        claimed: data[1],
        remaining: data[2],
        isCapReached: data[0] > 0n && data[2] === 0n,
        isUnlimited: data[0] === 0n,
      }
    : null;

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
