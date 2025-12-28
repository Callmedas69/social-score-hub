"use client";

import { useState, useMemo, memo } from "react";
import { ChevronDown, Gift } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePendingRewards } from "@/hooks/useRewards";
import { useDailyClaimStats } from "@/hooks/useDailyClaimStats";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { SupportedChainId } from "@/config/constants";

interface RewardsPreviewProps {
  chainId: SupportedChainId;
}

export const RewardsPreview = memo(function RewardsPreview({ chainId }: RewardsPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { rewards, isLoading } = usePendingRewards(chainId);
  const { stats: dailyStats, isLoading: loadingStats } = useDailyClaimStats(chainId);
  const tokenAddresses = useMemo(() => rewards.map((r) => r.token), [rewards]);
  const { metadataMap } = useTokenMetadata(tokenAddresses, chainId);

  const hasRewards = rewards.length > 0;
  const isCapReached = dailyStats?.isCapReached ?? false;
  const isUnlimited = dailyStats?.isUnlimited ?? true;
  const isAvailable = hasRewards && !isCapReached;

  if (isLoading || loadingStats) {
    return (
      <div className="mb-3">
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  // Format remaining claims display
  const remainingDisplay = dailyStats && !isUnlimited
    ? `${dailyStats.remaining}/${dailyStats.cap} left`
    : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-3">
      <CollapsibleTrigger
        className="flex items-center justify-between w-full px-3 text-[10px]"
      >
        <div className="flex items-center gap-2">
          <Gift
            className={`w-4 h-4 ${
              isCapReached
                ? "text-red-500"
                : isAvailable
                ? "text-green-600"
                : "text-gray-400"
            }`}
          />
          <span
            className={`italic ${
              isCapReached
                ? "text-red-600"
                : isAvailable
                ? "text-green-700"
                : "text-gray-500"
            }`}
          >
            AutoClaim Rewards
          </span>
          {hasRewards && !isCapReached && (
            <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5">
              {rewards.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCapReached ? (
            <span className="text-[10px] text-red-600 italic">
              Daily limit reached
            </span>
          ) : remainingDisplay ? (
            <span className="text-[10px] text-gray-500">{remainingDisplay}</span>
          ) : null}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isCapReached
                ? "text-red-500"
                : isAvailable
                ? "text-green-600"
                : "text-gray-400"
            } ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        {isCapReached ? (
          <p className="text-[10px] text-red-600 italic px-1">
            Daily reward limit has been reached. Try again tomorrow!
          </p>
        ) : hasRewards ? (
          <div className="flex flex-wrap gap-2 px-1">
            {rewards.map((reward) => {
              const metadata = metadataMap.get(reward.token);
              const displayAmount = metadata?.decimals
                ? formatTokenAmount(reward.amount, metadata.decimals)
                : reward.amount.toString();
              const displaySymbol =
                metadata?.symbol || shortenAddress(reward.token);

              return (
                <Badge
                  key={reward.token}
                  variant="outline"
                  className="text-green-700 bg-green-100 border-green-200 text-[7px]"
                >
                  +{displayAmount} {displaySymbol}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-[8px] italic text-gray-500 px-1">
            No rewards available for next check-in
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
});
