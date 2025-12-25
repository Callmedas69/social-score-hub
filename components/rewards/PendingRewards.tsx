"use client";

import { usePendingRewards } from "@/hooks/useRewards";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RewardToken } from "@/types";

function PendingRewardItem({
  reward,
  symbol,
  decimals,
}: {
  reward: RewardToken;
  symbol?: string;
  decimals?: number;
}) {
  const displayAmount =
    decimals !== undefined
      ? formatTokenAmount(reward.amount, decimals)
      : reward.amount.toString();

  return (
    <Card className="py-3 bg-green-50 border-green-200">
      <CardContent className="py-0 flex justify-between items-center">
        <div>
          <p className="font-semibold text-green-800">
            {symbol || shortenAddress(reward.token)}
          </p>
          {!symbol && (
            <p className="text-xs text-green-600 font-mono">
              {reward.token}
            </p>
          )}
        </div>
        <p className="font-bold text-lg text-green-800">
          +{displayAmount}
        </p>
      </CardContent>
    </Card>
  );
}

export function PendingRewards() {
  const { rewards, isLoading, error } = usePendingRewards();
  const tokenAddresses = rewards.map((r) => r.token);
  const { metadataMap, isLoading: loadingMetadata } =
    useTokenMetadata(tokenAddresses);

  if (isLoading || loadingMetadata) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">Failed to load pending rewards</p>
    );
  }

  if (rewards.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No pending rewards
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rewards.map((reward, idx) => {
        const metadata = metadataMap.get(reward.token);
        return (
          <PendingRewardItem
            key={idx}
            reward={reward}
            symbol={metadata?.symbol}
            decimals={metadata?.decimals}
          />
        );
      })}
    </div>
  );
}
