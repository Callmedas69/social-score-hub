import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { ERC20_ABI, type SupportedChainId } from "@/config/constants";
import type { TokenMetadata } from "@/types";

export function useTokenMetadata(tokenAddresses: `0x${string}`[], chainId?: SupportedChainId) {
  const contracts = useMemo(
    () =>
      tokenAddresses.flatMap((address) => [
        { address, abi: ERC20_ABI, functionName: "name" as const, chainId },
        { address, abi: ERC20_ABI, functionName: "symbol" as const, chainId },
        { address, abi: ERC20_ABI, functionName: "decimals" as const, chainId },
      ]),
    [tokenAddresses, chainId]
  );

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: tokenAddresses.length > 0,
    },
  });

  const metadataMap: Map<`0x${string}`, TokenMetadata> = new Map();

  if (data) {
    for (let i = 0; i < tokenAddresses.length; i++) {
      const baseIndex = i * 3;
      const name = data[baseIndex]?.result as string | undefined;
      const symbol = data[baseIndex + 1]?.result as string | undefined;
      const decimals = data[baseIndex + 2]?.result as number | undefined;

      if (name && symbol && decimals !== undefined) {
        metadataMap.set(tokenAddresses[i], {
          address: tokenAddresses[i],
          name,
          symbol,
          decimals,
        });
      }
    }
  }

  return { metadataMap, isLoading, error };
}
