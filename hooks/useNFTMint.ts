import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { SOCIAL_SCORE_HUB_NFT_ABI } from "@/abi/SocialScoreHubNFT";
import { NFT_ADDRESSES, SupportedChainId } from "@/config/constants";

export function useNFTMint(chainId: SupportedChainId = base.id) {
  const contractAddress = NFT_ADDRESSES[chainId];

  // Read mint price from contract
  const { data: mintPrice } = useReadContract({
    address: contractAddress,
    abi: SOCIAL_SCORE_HUB_NFT_ABI,
    functionName: "MINT_PRICE",
    chainId,
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
      address: contractAddress,
      abi: SOCIAL_SCORE_HUB_NFT_ABI,
      functionName: "mint",
      chainId,
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
