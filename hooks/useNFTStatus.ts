import { useReadContract, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { SOCIAL_SCORE_HUB_NFT_ABI } from "@/abi/SocialScoreHubNFT";
import { NFT_ADDRESSES, SupportedChainId } from "@/config/constants";

export function useNFTStatus(chainId: SupportedChainId = base.id) {
  const { address } = useAccount();
  const contractAddress = NFT_ADDRESSES[chainId];

  // Read mint price
  const { data: mintPrice, isLoading: isLoadingPrice } = useReadContract({
    address: contractAddress,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "MINT_PRICE",
    chainId,
  });

  // Read cooldown duration
  const { data: cooldownDuration } = useReadContract({
    address: contractAddress,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "MINT_COOLDOWN",
    chainId,
  });

  // Read user's last mint timestamp
  const {
    data: lastMintTimestamp,
    isLoading: isLoadingTimestamp,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "lastMintTimestamp",
    args: address ? [address] : undefined,
    chainId,
    query: {
      staleTime: 0, // Always fetch fresh data for accurate cooldown
    },
  });

  // Calculate if user can mint and time remaining
  const now = BigInt(Math.floor(Date.now() / 1000));
  const lastMint = lastMintTimestamp ?? 0n;
  const cooldown = cooldownDuration ?? 0n;

  const nextMintTime = lastMint + cooldown;
  const canMint = lastMint === 0n || now >= nextMintTime;
  const timeRemaining = canMint ? 0n : nextMintTime - now;

  return {
    canMint,
    timeRemaining,
    mintPrice,
    cooldownDuration,
    isLoading: isLoadingPrice || isLoadingTimestamp,
    refetch,
  };
}
