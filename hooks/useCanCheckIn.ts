import { useReadContract, useAccount } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";
import type { CheckInStatus } from "@/types";

export function useCanCheckIn(chainId: SupportedChainId) {
  const { address, isConnected } = useAccount();
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "canUserCheckIn",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: isConnected && !!address,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours - matches contract check-in period
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
