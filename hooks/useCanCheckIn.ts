import { useReadContract, useAccount } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";
import type { CheckInStatus } from "@/types";

export function useCanCheckIn(chainId: SupportedChainId) {
  const { address } = useAccount();
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "canUserCheckIn",
    args: address ? [address] : undefined,
    chainId,
    query: {
      staleTime: 0, // Always fetch fresh for cooldown
    },
  });

  const status: CheckInStatus | null = data
    ? { canCheckIn: data[0], timeRemaining: data[1] }
    : null;

  return {
    status,
    isLoading,
    error,
    refetch,
  };
}
