"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Share2, Check, Flame, Trophy, Calendar } from "lucide-react";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingRewards } from "@/hooks/useRewards";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";
import { DOMAIN_URL } from "@/config/constants";
import type { FormattedUserStats } from "@/types";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: FormattedUserStats | null;
  isLoadingStats?: boolean;
  chainName: string;
  accentColor: string;
}

export const SuccessModal = memo(function SuccessModal({
  isOpen,
  onClose,
  stats,
  isLoadingStats = false,
  chainName,
  accentColor,
}: SuccessModalProps) {
  const { address } = useAccount();
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { rewards } = usePendingRewards();
  const tokenAddresses = useMemo(() => rewards.map((r) => r.token), [rewards]);
  const { metadataMap } = useTokenMetadata(tokenAddresses);

  const handleShare = useCallback(async () => {
    setIsSharing(true);

    const streakText = stats?.currentStreak
      ? `${stats.currentStreak}-day streak 🔥 - I earn USDC rewards`
      : "First Hello to Base! I earn USDC rewards";
    const shareText = `${streakText} on Hello Onchain!`;
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
  }, [stats?.currentStreak, address]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-sm border-2 p-6 rounded-none"
        style={{ borderColor: accentColor }}
        showCloseButton={false}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-display tracking-tight">
            GM! {chainName} morning!
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Check-in successful
          </p>
        </DialogHeader>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {isLoadingStats ? (
                <Skeleton className="w-8 h-7 mx-auto" />
              ) : (
                stats?.currentStreak ?? 0
              )}
            </div>
            <div className="text-xs text-gray-500">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {isLoadingStats ? (
                <Skeleton className="w-8 h-7 mx-auto" />
              ) : (
                stats?.longestStreak ?? 0
              )}
            </div>
            <div className="text-xs text-gray-500">Longest</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {isLoadingStats ? (
                <Skeleton className="w-8 h-7 mx-auto" />
              ) : (
                stats?.totalCheckIns ?? 0
              )}
            </div>
            <div className="text-xs text-gray-500">All-Time</div>
          </div>
        </div>

        {/* Rewards Section */}
        {rewards.length > 0 && (
          <div className="py-3">
            <p className="text-xs text-gray-500 mb-2 text-center">
              Rewards earned
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {rewards.map((reward) => {
                const metadata = metadataMap.get(reward.token);
                const displayAmount = metadata?.decimals
                  ? formatTokenAmount(reward.amount, metadata.decimals)
                  : reward.amount.toString();
                const displaySymbol =
                  metadata?.symbol || shortenAddress(reward.token);

                return (
                  <span
                    key={reward.token}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 border border-green-200"
                  >
                    +{displayAmount} {displaySymbol}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
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
