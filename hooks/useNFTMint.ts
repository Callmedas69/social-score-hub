import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import {
  SOCIAL_SCORE_HUB_NFT_ADDRESS,
  SOCIAL_SCORE_HUB_NFT_ABI,
} from "@/abi/SocialScoreHubNFT";

export function useNFTMint() {
  // Read mint price from contract
  const { data: mintPrice } = useReadContract({
    address: SOCIAL_SCORE_HUB_NFT_ADDRESS,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "MINT_PRICE",
    chainId: base.id,
  });

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

  const mint = () => {
    if (!mintPrice) return;

    writeContract({
      address: SOCIAL_SCORE_HUB_NFT_ADDRESS,
      abi: SOCIAL_SCORE_HUB_NFT_ABI,
      functionName: "mint",
      chainId: base.id,
      value: mintPrice,
    });
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || confirmError,
    reset,
    mintPrice,
  };
}
