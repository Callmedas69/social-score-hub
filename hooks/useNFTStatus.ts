import { useReadContract, useAccount } from "wagmi";
import { base } from "wagmi/chains";
import {
  SOCIAL_SCORE_HUB_NFT_ADDRESS,
  SOCIAL_SCORE_HUB_NFT_ABI,
} from "@/abi/SocialScoreHubNFT";

export function useNFTStatus() {
  const { address, isConnected } = useAccount();

  // Read mint price
  const { data: mintPrice, isLoading: isLoadingPrice } = useReadContract({
    address: SOCIAL_SCORE_HUB_NFT_ADDRESS,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "MINT_PRICE",
    chainId: base.id,
  });

  // Read cooldown duration
  const { data: cooldownDuration } = useReadContract({
    address: SOCIAL_SCORE_HUB_NFT_ADDRESS,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "MINT_COOLDOWN",
    chainId: base.id,
  });

  // Read user's last mint timestamp
  const {
    data: lastMintTimestamp,
    isLoading: isLoadingTimestamp,
    refetch,
  } = useReadContract({
    address: SOCIAL_SCORE_HUB_NFT_ADDRESS,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "lastMintTimestamp",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: isConnected && !!address,
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
