"use client";

import { useUserStats } from "@/hooks/useUserStats";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPPORTED_CHAINS, CHAIN_CONFIG, type SupportedChainId } from "@/config/constants";

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ChainStatsCard({ chainId }: { chainId: SupportedChainId }) {
  const config = CHAIN_CONFIG[chainId];
  const { formatted, isLoading } = useUserStats(chainId);

  if (isLoading) {
    return <Skeleton className="h-48 rounded-xl" />;
  }

  return (
    <Card className="border-t-4" style={{ borderTopColor: config.color }}>
      <CardHeader className="pb-2">
        <span className="font-display text-lg font-bold">{config.name}</span>
      </CardHeader>
      <CardContent className="pt-0">
        {!formatted || formatted.totalCheckIns === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No check-ins yet
          </p>
        ) : (
          <>
            <StatItem
              label="Current Streak"
              value={`${formatted.currentStreak} days`}
            />
            <StatItem
              label="Longest Streak"
              value={`${formatted.longestStreak} days`}
            />
            <StatItem label="Total Check-ins" value={formatted.totalCheckIns} />
            <StatItem
              label="First Check-in"
              value={formatted.firstCheckIn ? formatDate(formatted.firstCheckIn) : "Never"}
            />
            <StatItem
              label="Last Check-in"
              value={formatted.lastCheckIn ? formatDate(formatted.lastCheckIn) : "Never"}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsDisplay() {
  return (
    <div className="space-y-4">
      {SUPPORTED_CHAINS.map((chain) => (
        <ChainStatsCard key={chain.id} chainId={chain.id} />
      ))}
    </div>
  );
}
