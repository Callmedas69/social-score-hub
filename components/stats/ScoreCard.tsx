"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Provider identifiers for brand colors
type ProviderId = "talent" | "neynar" | "gitcoin" | "ethos" | "quotient" | "ssa";

interface ScoreCardProps {
  provider: string;
  providerId?: ProviderId;
  providerLogo?: string;
  score: string | number | null;
  maxScore?: string;
  description?: string;
  tierLabel?: string | null;
  isLoading?: boolean;
  error?: Error | null;
  notFound?: boolean;
}

// Base card styles for hover effect
const CARD_BASE = "p-4 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";

// Consolidated provider styles (DRY - replaces 3 switch statements)
const PROVIDER_STYLES = {
  talent: {
    card: `${CARD_BASE} bg-gray-100 border-gray-300`,
    text: "text-gray-700",
    score: "text-gray-800",
  },
  neynar: {
    card: `${CARD_BASE} bg-purple-50 border-purple-200`,
    text: "text-purple-700",
    score: "text-purple-600",
  },
  gitcoin: {
    card: `${CARD_BASE} bg-emerald-50 border-emerald-200`,
    text: "text-emerald-700",
    score: "text-emerald-600",
  },
  ethos: {
    card: `${CARD_BASE} bg-stone-100 border-stone-300`,
    text: "text-stone-700",
    score: "text-stone-600",
  },
  quotient: {
    card: `${CARD_BASE} bg-orange-50 border-orange-200`,
    text: "text-orange-700",
    score: "text-orange-600",
  },
  ssa: {
    card: `${CARD_BASE} bg-cyan-50 border-cyan-200`,
    text: "text-cyan-700",
    score: "text-cyan-600",
  },
} as const;

const DEFAULT_STYLES = {
  card: `${CARD_BASE} bg-gray-50 border-gray-200`,
  text: "text-gray-700",
  score: "text-gray-600",
};

const NOT_FOUND_STYLES = {
  card: "p-4 border bg-gray-50 border-gray-100",
  text: "text-gray-400",
  score: "text-gray-300",
};

function getStyles(providerId: ProviderId | undefined, notFound: boolean) {
  if (notFound) return NOT_FOUND_STYLES;
  return providerId ? PROVIDER_STYLES[providerId] : DEFAULT_STYLES;
}

export const ScoreCard = memo(function ScoreCard({
  provider,
  providerId,
  providerLogo,
  score,
  maxScore,
  description,
  tierLabel,
  isLoading = false,
  error,
  notFound = false,
}: ScoreCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-6 w-6 rounded-full animate-pulse" />
          <Skeleton className="h-4 w-20 animate-pulse" />
        </div>
        <Skeleton className="h-7 w-16 mb-1 animate-pulse" />
        <Skeleton className="h-4 w-16 mb-1 animate-pulse" />
        <Skeleton className="h-3 w-24 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white border border-red-100">
        <div className="flex items-center gap-2 mb-3">
          {providerLogo && (
            <div className="w-6 h-6 rounded-full overflow-hidden relative opacity-50">
              <Image
                src={providerLogo}
                alt={provider}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span className="text-sm font-medium text-gray-500">{provider}</span>
        </div>
        <p className="text-xl font-bold text-gray-300 mb-1">-</p>
        <p className="text-xs text-red-500">Failed to load</p>
        <p className="text-[10px] text-gray-400 mt-1 italic">{description || "\u00A0"}</p>
      </div>
    );
  }

  const displayScore = notFound ? "-" : score ?? "-";
  const styles = getStyles(providerId, notFound);

  return (
    <div className={styles.card}>
      {/* Provider header with logo */}
      <div className="flex items-center gap-2 mb-3">
        {providerLogo && (
          <div className={`w-6 h-6 rounded-full overflow-hidden relative ${notFound ? "opacity-50" : ""}`}>
            <Image
              src={providerLogo}
              alt={provider}
              fill
              className="object-cover"
            />
          </div>
        )}
        <span className={`text-sm font-medium ${styles.text}`}>
          {provider}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-xl md:text-2xl font-bold ${styles.score}`}>
          {displayScore}
        </span>
        {maxScore && !notFound && score !== null && (
          <span className="text-xs md:text-sm text-gray-400">/{maxScore}</span>
        )}
      </div>

      {/* Tier label - always show, dash when no value */}
      <span className={`text-xs font-medium ${styles.text}`}>
        {tierLabel || "-"}
      </span>

      {/* Description */}
      <p className="text-[10px] text-gray-500 mt-1 italic">
        {notFound ? "No profile found" : description || "\u00A0"}
      </p>
    </div>
  );
});
