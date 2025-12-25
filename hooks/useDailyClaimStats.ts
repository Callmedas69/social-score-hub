import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/constants";

export interface DailyClaimStats {
  cap: bigint;
  claimed: bigint;
  remaining: bigint;
  isCapReached: boolean;
  isUnlimited: boolean;
}

export function useDailyClaimStats() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getDailyClaimStats",
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
