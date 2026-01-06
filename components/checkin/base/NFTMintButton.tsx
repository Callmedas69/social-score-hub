"use client";

import { base, celo } from "wagmi/chains";
import { useNFTMintController } from "@/hooks/useNFTMintController";
import { NFTMintButtonView } from "./NFTMintButtonView";
import { CHAIN_CONFIG, SupportedChainId } from "@/config/constants";

interface NFTMintButtonProps {
  canMint: boolean;
  timeRemaining: bigint;
  mintPrice?: bigint;
  onSuccess?: () => void | Promise<void>;
  onCooldownComplete?: () => void;
  isLoading?: boolean;
  chainId?: SupportedChainId;
}

export function NFTMintButton({
  canMint,
  timeRemaining,
  onSuccess,
  onCooldownComplete,
  isLoading = false,
  chainId = base.id,
}: NFTMintButtonProps) {
  const chainConfig = CHAIN_CONFIG[chainId];

  const [state, actions] = useNFTMintController({
    chainId,
    canMint,
    timeRemaining,
    isLoading,
    onSuccess,
    onCooldownComplete,
  });

  // Use dark text for light backgrounds (Celo yellow)
  const textColor = chainId === celo.id ? "text-gray-900" : "text-white";

  return (
    <NFTMintButtonView
      phase={state.phase}
      secondsRemaining={state.secondsRemaining}
      chainName={chainConfig.name}
      accentColor={chainConfig.color}
      textColor={textColor}
      error={state.error}
      mintPrice={state.mintPrice}
      onMint={actions.mint}
      onSwitchChain={actions.switchChain}
    />
  );
}
