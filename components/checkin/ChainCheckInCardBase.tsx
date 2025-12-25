"use client";

import { useCallback, memo, type CSSProperties } from "react";
import Image from "next/image";
import { CheckInButton } from "./CheckInButton";
import { RewardsPreview } from "./RewardsPreview";
import { useCanCheckIn } from "@/hooks/useCanCheckIn";
import { useUserStats } from "@/hooks/useUserStats";
import { CHAIN_CONFIG, type SupportedChainId } from "@/config/constants";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/animations";

interface ChainCheckInCardBaseProps {
  chainId: SupportedChainId;
  className?: string;
  cardStyle?: CSSProperties;
  showRewardsPreview?: boolean;
}

export const ChainCheckInCardBase = memo(function ChainCheckInCardBase({
  chainId,
  className,
  cardStyle,
  showRewardsPreview = false,
}: ChainCheckInCardBaseProps) {
  const config = CHAIN_CONFIG[chainId];
  const { status, isLoading, refetch: refetchStatus } = useCanCheckIn(chainId);
  const { formatted, refetch: refetchStats } = useUserStats(chainId);

  const handleCheckInSuccess = useCallback(() => {
    refetchStatus();
    refetchStats();
  }, [refetchStatus, refetchStats]);

  return (
    <div
      className={cn("border p-3", className)}
      style={cardStyle}
    >
      {/* Top row: Logo + Stats */}
      <div className="flex items-center justify-between mb-3">
        {/* Chain logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image
            src={config.logo}
            alt={config.name}
            width={120}
            height={36}
            className="h-4 md:h-6 w-auto"
          />
          {config.wordmark && (
            <Image
              src={config.wordmark}
              alt={config.name}
              width={120}
              height={28}
              className="h-4 md:h-6 w-auto hidden sm:block"
            />
          )}
        </div>

        {/* Stats: Current | Highest | All-Time */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-center">
            <div className="text-xs md:text-lg font-bold text-gray-900">
              <CountUp end={formatted?.currentStreak ?? 0} delay={1} />
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-lg font-bold text-gray-900">
              <CountUp end={formatted?.longestStreak ?? 0} delay={1.1} />
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">Longest</div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-lg font-bold text-gray-900">
              <CountUp end={formatted?.totalCheckIns ?? 0} delay={1.2} />
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">All-Time</div>
          </div>
        </div>
      </div>

      {/* AutoClaim Rewards Preview */}
      {showRewardsPreview && <RewardsPreview />}

      {/* Action button */}
      <CheckInButton
        chainId={chainId}
        canCheckIn={status?.canCheckIn ?? false}
        timeRemaining={status?.timeRemaining ?? 0n}
        onSuccess={handleCheckInSuccess}
        onCooldownComplete={refetchStatus}
        accentColor={config.color}
        chainName={config.name}
        isLoading={isLoading}
      />
    </div>
  );
});
