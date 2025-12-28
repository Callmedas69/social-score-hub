import { useReadContract, useAccount } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";
import type { RewardToken } from "@/types";

export function useActiveRewards(chainId: SupportedChainId) {
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getAllActiveRewards",
    chainId,
  });

  const rewards: RewardToken[] = (data as RewardToken[]) || [];

  return { rewards, isLoading, error, refetch };
}

export function usePendingRewards(chainId: SupportedChainId) {
  const { address, isConnected } = useAccount();
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "willReceiveRewards",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const rewards: RewardToken[] = (data as RewardToken[]) || [];

  return { rewards, isLoading, error, refetch };
}
