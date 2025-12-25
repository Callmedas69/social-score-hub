"use client";

import { useActiveRewards } from "@/hooks/useRewards";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { formatTokenAmount, shortenAddress } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RewardToken } from "@/types";

function RewardItem({
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
    <Card className="py-3">
      <CardContent className="py-0 flex justify-between items-center">
        <div>
          <p className="font-semibold">
            {symbol || shortenAddress(reward.token)}
          </p>
          {!symbol && (
            <p className="text-xs text-muted-foreground font-mono">
              {reward.token}
            </p>
          )}
        </div>
        <p className="font-bold text-lg">{displayAmount}</p>
      </CardContent>
    </Card>
  );
}

export function RewardsList() {
  const { rewards, isLoading, error } = useActiveRewards();
  const tokenAddresses = rewards.map((r) => r.token);
  const { metadataMap, isLoading: loadingMetadata } =
    useTokenMetadata(tokenAddresses);

  if (isLoading || loadingMetadata) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">Failed to load rewards</p>
    );
  }

  if (rewards.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No active rewards
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rewards.map((reward, idx) => {
        const metadata = metadataMap.get(reward.token);
        return (
          <RewardItem
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
