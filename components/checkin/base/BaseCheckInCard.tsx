"use client";

import { useCallback, useState, memo } from "react";
import Image from "next/image";
import { base } from "wagmi/chains";
import { CheckInButton } from "../CheckInButton";
import { RewardsPreview } from "../RewardsPreview";
import { SuccessModal } from "../SuccessModal";
import { useCanCheckIn } from "@/hooks/useCanCheckIn";
import { useUserStats } from "@/hooks/useUserStats";
import { CHAIN_CONFIG, CHECKIN_ADDRESSES } from "@/config/constants";
import { Skeleton } from "@/components/ui/skeleton";

// Base chain configuration
const CHAIN_ID = base.id;
const config = CHAIN_CONFIG[CHAIN_ID];

export const BaseCheckInCard = memo(function BaseCheckInCard() {
  const { status, isLoading, refetch: refetchStatus } = useCanCheckIn(CHAIN_ID);
  const { formatted, isLoading: isLoadingStats, refetch: refetchStats } = useUserStats(CHAIN_ID);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCheckInSuccess = useCallback(async () => {
    await Promise.all([refetchStatus(), refetchStats()]);
    setShowSuccessModal(true);
  }, [refetchStatus, refetchStats]);

  return (
    <div className="border p-3 bg-white border-blue-200">
      {/* Top row: Logo + Stats */}
      <div className="flex items-center justify-between mb-2">
        {/* Chain logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image
            src={config.logo}
            alt={config.name}
            width={120}
            height={36}
            className="h-4 md:h-6 w-auto"
          />
        </div>

        {/* Stats: Current | Highest | All-Time */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-center">
            <div className="text-xs md:text-lg font-bold text-gray-900 tracking-tight">
              {isLoadingStats ? (
                <Skeleton className="w-6 h-4 md:h-5 mx-auto" />
              ) : (
                formatted?.currentStreak ?? 0
              )}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-lg font-bold text-gray-900 tracking-tight">
              {isLoadingStats ? (
                <Skeleton className="w-6 h-4 md:h-5 mx-auto" />
              ) : (
                formatted?.longestStreak ?? 0
              )}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">Longest</div>
          </div>
          <div className="text-center">
            <div className="text-xs md:text-lg font-bold text-gray-900 tracking-tight">
              {isLoadingStats ? (
                <Skeleton className="w-6 h-4 md:h-5 mx-auto" />
              ) : (
                formatted?.totalCheckIns ?? 0
              )}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">All-Time</div>
          </div>
        </div>
      </div>

      {/* Welcome message for new users */}
      {!isLoadingStats && formatted?.totalCheckIns === 0 && (
        <p className="text-xs text-gray-500 text-center mb-2 italic">
          Start your streak today!
        </p>
      )}

      {/* AutoClaim Rewards Preview */}
      <RewardsPreview chainId={CHAIN_ID} />

      {/* Action button */}
      <CheckInButton
        chainId={CHAIN_ID}
        canCheckIn={status?.canCheckIn ?? false}
        timeRemaining={status?.timeRemaining ?? 0n}
        onSuccess={handleCheckInSuccess}
        onCooldownComplete={refetchStatus}
        accentColor={config.color}
        chainName={config.name}
        isLoading={isLoading}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        stats={formatted}
        isLoadingStats={isLoadingStats}
        chainName={config.name}
        accentColor={config.color}
        chainId={CHAIN_ID}
      />

      {/* Footer: Contract & Gas Info */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <a
          href={`https://basescan.org/address/${CHECKIN_ADDRESSES[CHAIN_ID]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] text-gray-400 hover:text-gray-600 font-mono"
        >
          {CHECKIN_ADDRESSES[CHAIN_ID].slice(0, 6)}...{CHECKIN_ADDRESSES[CHAIN_ID].slice(-4)}
        </a>
        <span className="text-[8px] text-gray-400">
          Gas: ETH
        </span>
      </div>
    </div>
  );
});
