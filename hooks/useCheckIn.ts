import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CHECKIN_ADDRESSES, CONTRACT_ABI, type SupportedChainId } from "@/config/constants";

export function useCheckIn(chainId: SupportedChainId) {
  const contractAddress = CHECKIN_ADDRESSES[chainId];

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const checkIn = () => {
    writeContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      functionName: "helloOnchain",
      chainId,
    });
  };

  return {
    checkIn,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || confirmError,
    reset,
  };
}
