"use client";

import { useCallback, useState, memo } from "react";
import { base } from "wagmi/chains";
import { NFTMintButton } from "./NFTMintButton";
import { NFTSuccessModal } from "./NFTSuccessModal";
import { useNFTStatus } from "@/hooks/useNFTStatus";
import {
  NFT_ADDRESSES,
  BLOCK_EXPLORER_URLS,
  NATIVE_CURRENCY,
  CHAIN_CONFIG,
  SupportedChainId,
} from "@/config/constants";

interface NFTMintCardProps {
  chainId?: SupportedChainId;
}

export const NFTMintCard = memo(function NFTMintCard({
  chainId = base.id,
}: NFTMintCardProps) {
  const { canMint, timeRemaining, mintPrice, isLoading, refetch } =
    useNFTStatus(chainId);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const contractAddress = NFT_ADDRESSES[chainId];
  const explorerUrl = BLOCK_EXPLORER_URLS[chainId];
  const nativeCurrency = NATIVE_CURRENCY[chainId];
  const chainConfig = CHAIN_CONFIG[chainId];

  // Border color based on chain
  const borderColorClass = chainId === base.id ? "border-blue-200" : "border-yellow-300";

  const handleMintSuccess = useCallback(async () => {
    await refetch();
    setShowSuccessModal(true);
  }, [refetch]);

  return (
    <div className={`border p-3 bg-white ${borderColorClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-bold text-gray-900 mb-4">
            Social Score Hub NFT
          </span>
        </div>
      </div>

      {/* Mint Button */}
      <NFTMintButton
        canMint={canMint}
        timeRemaining={timeRemaining}
        mintPrice={mintPrice}
        onSuccess={handleMintSuccess}
        onCooldownComplete={refetch}
        isLoading={isLoading}
        chainId={chainId}
      />

      {/* Success Modal */}
      <NFTSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        chainId={chainId}
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <a
          href={`${explorerUrl}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] text-gray-400 hover:text-gray-600 font-mono"
        >
          {contractAddress.slice(0, 6)}...
          {contractAddress.slice(-4)}
        </a>
        <span className="text-[8px] text-gray-400">Gas: {nativeCurrency}</span>
      </div>
    </div>
  );
});
