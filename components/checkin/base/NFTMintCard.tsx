"use client";

import { useCallback, useState, memo } from "react";
import { NFTMintButton } from "./NFTMintButton";
import { NFTSuccessModal } from "./NFTSuccessModal";
import { useNFTStatus } from "@/hooks/useNFTStatus";
import { SOCIAL_SCORE_HUB_NFT_ADDRESS } from "@/abi/SocialScoreHubNFT";

export const NFTMintCard = memo(function NFTMintCard() {
  const { canMint, timeRemaining, mintPrice, isLoading, refetch } =
    useNFTStatus();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleMintSuccess = useCallback(async () => {
    await refetch();
    setShowSuccessModal(true);
  }, [refetch]);

  return (
    <div className="border p-3 bg-white border-blue-200">
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
      />

      {/* Success Modal */}
      <NFTSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <a
          href={`https://basescan.org/address/${SOCIAL_SCORE_HUB_NFT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] text-gray-400 hover:text-gray-600 font-mono"
        >
          {SOCIAL_SCORE_HUB_NFT_ADDRESS.slice(0, 6)}...
          {SOCIAL_SCORE_HUB_NFT_ADDRESS.slice(-4)}
        </a>
        <span className="text-[8px] text-gray-400">Gas: ETH</span>
      </div>
    </div>
  );
});
