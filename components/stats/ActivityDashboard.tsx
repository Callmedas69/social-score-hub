"use client";

import { useOnchainActivity } from "@/hooks/useOnchainActivity";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ExternalLink } from "lucide-react";

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
      <div className="text-lg md:text-2xl font-bold text-blue-600">{value}</div>
      <div className="text-[10px] md:text-xs text-gray-500 mt-1">{label}</div>
      {subValue && <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">{subValue}</div>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Heatmap skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatActivityPeriod(totalDays: number): string {
  if (totalDays === 0) return "0d";

  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0 || parts.length === 0) parts.push(`${days}d`);

  return parts.join(" ");
}

export function ActivityDashboard() {
  const { dailyCounts, summary, isLoading, error } = useOnchainActivity();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            Failed to load activity data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Heatmap */}
      <Card className="gap-2">
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ActivityHeatmap dailyCounts={dailyCounts} />
          {/* Alchemy Attribution */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-[8px] text-gray-400 italic">
              Powered by Alchemy
            </span>
            <a
              href="https://www.alchemy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[8px] text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              alchemy.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Transactions"
          value={summary.totalTransactions}
          subValue="on Base"
        />
        <StatCard
          label="Unique Days"
          value={summary.uniqueDaysActive}
          subValue="active"
        />
        <StatCard
          label="Activity Period"
          value={formatActivityPeriod(summary.activityPeriodDays)}
        />
        <StatCard
          label="Contract Calls"
          value={summary.contractInteractions}
        />
      </div>

      {/* Date Info */}
      <Card className="gap-0">
        <CardContent>
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-gray-500">First Transaction</span>
              <p className="font-medium">{formatDate(summary.firstTxDate)}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-500">Last Transaction</span>
              <p className="font-medium">{formatDate(summary.lastTxDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
