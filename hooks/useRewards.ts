import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/constants";
import type { RewardToken } from "@/types";

export function useActiveRewards() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllActiveRewards",
  });

  const rewards: RewardToken[] = (data as RewardToken[]) || [];

  return { rewards, isLoading, error, refetch };
}

export function usePendingRewards() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "willReceiveRewards",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const rewards: RewardToken[] = (data as RewardToken[]) || [];

  return { rewards, isLoading, error, refetch };
}
