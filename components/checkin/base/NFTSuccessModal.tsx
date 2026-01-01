"use client";

import { useState, useCallback, memo } from "react";
import { Share2, Check, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DOMAIN_URL,
  NFT_ADDRESSES,
  BLOCK_EXPLORER_URLS,
  CHAIN_CONFIG,
  SupportedChainId,
} from "@/config/constants";

interface NFTSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId?: SupportedChainId;
}

export const NFTSuccessModal = memo(function NFTSuccessModal({
  isOpen,
  onClose,
  chainId = base.id,
}: NFTSuccessModalProps) {
  const { address } = useAccount();
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const contractAddress = NFT_ADDRESSES[chainId];
  const explorerUrl = BLOCK_EXPLORER_URLS[chainId];
  const chainConfig = CHAIN_CONFIG[chainId];
  const explorerName = chainId === base.id ? "BaseScan" : "CeloScan";

  const handleShare = useCallback(async () => {
    setIsSharing(true);

    const shareText = `Just minted my Social Score Hub NFT on ${chainConfig.name}!`;
    const sharePageUrl = address
      ? `${DOMAIN_URL}/share/checkin/${address}`
      : `${DOMAIN_URL}/checkin`;

    // Try Farcaster composeCast first
    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [sharePageUrl] as [string],
      });
      setIsSharing(false);
      return;
    } catch {
      // Not in Farcaster or composeCast failed - fallback to clipboard
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${sharePageUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this:", `${shareText}\n${sharePageUrl}`);
    }

    setIsSharing(false);
  }, [address, chainConfig.name]);

  const accentColor = chainConfig.color;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="border-2 p-4 rounded-none max-w-[90vw]"
        style={{ borderColor: accentColor }}
        showCloseButton={false}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            NFT Minted!
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-gray-600 text-sm">
            Your Social Score Hub NFT has been minted successfully!
          </p>
          <a
            href={`${explorerUrl}/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-xs hover:underline mt-2 inline-block"
          >
            View on {explorerName}
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            disabled={isSharing}
            variant="outline"
            className="flex-1 rounded-none"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 text-white rounded-none"
            style={{ backgroundColor: accentColor }}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
