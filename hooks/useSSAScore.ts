"use client";

import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { ProfileSBTABI } from "@/abi/ProfileSBT";
import { SSA_CONTRACT_ADDRESS } from "@/config/constants";

export function useSSAScore(address?: `0x${string}`) {
  const { data: ssaIndex, isLoading, error } = useReadContract({
    address: SSA_CONTRACT_ADDRESS,
    abi: ProfileSBTABI,
    functionName: "getUserSSAIndex",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!SSA_CONTRACT_ADDRESS,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    },
  });

  const { data: hasMinted } = useReadContract({
    address: SSA_CONTRACT_ADDRESS,
    abi: ProfileSBTABI,
    functionName: "hasMinted",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && !!SSA_CONTRACT_ADDRESS,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
    },
  });

  return {
    ssaIndex: ssaIndex ? Number(ssaIndex) : null,
    hasMinted: hasMinted ?? false,
    isLoading,
    error,
  };
}
