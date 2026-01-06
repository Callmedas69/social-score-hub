"use client";

import { memo, useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useSocialScores } from "@/hooks/useSocialScores";
import { useWalletSecurity } from "@/hooks/useWalletSecurity";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Shield,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function LoadingSkeleton() {
  return (
    <Card className="rounded-none">
      <CardContent>
        {/* Profile skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <div className="border-t border-gray-100 my-3" />
        {/* Security skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreStrokeColor(score: number) {
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 50) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function getScoreTextColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

const RadialProgress = memo(function RadialProgress({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.floor(eased * score));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [score]);

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getScoreStrokeColor(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>
      {/* Center score */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${getScoreTextColor(score)}`}>
          {displayScore}
        </span>
      </div>
    </div>
  );
});

export const ProfileSecurityCard = memo(function ProfileSecurityCard() {
  const { address } = useAccount();
  const { neynar } = useSocialScores();
  const { security, score, flags, isLoading: securityLoading, error: securityError } = useWalletSecurity();
  const [isOpen, setIsOpen] = useState(false);

  // Show loading if either is loading
  if (neynar.isLoading || securityLoading) {
    return <LoadingSkeleton />;
  }

  const user = neynar.data;

  return (
    <Card className="rounded-none">
      <CardContent>
        {/* Profile Section */}
        {!user || !user.fid ? (
          // No Farcaster account linked
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {address ? address.slice(2, 4).toUpperCase() : "?"}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400 italic">
                No Farcaster account linked
              </p>
              {address && (
                <span className="inline-block px-2 py-0.5 text-[10px] bg-gray-100 rounded-full font-mono text-gray-600 mt-1">
                  {truncateAddress(address)}
                </span>
              )}
            </div>
          </div>
        ) : (
          // Farcaster user found
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                {user.pfp_url ? (
                  <img
                    src={user.pfp_url}
                    alt={user.display_name || user.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {user.display_name || user.username}
              </h3>
              {user.username && (
                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              )}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full">
                  FID: {user.fid}
                </span>
                {address && (
                  <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full font-mono">
                    {truncateAddress(address)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Security Section */}
        {securityError || !security ? (
          // Security API failed
          <div className="flex items-center gap-2 text-gray-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Security</span>
            <span className="text-xs italic ml-auto">Unable to fetch</span>
          </div>
        ) : (
          // Security data available
          <div className="flex items-center gap-3">
            <RadialProgress score={score} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Security</span>
              </div>
              {flags.length > 0 ? (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-[8px] text-gray-600 hover:text-gray-900 italic">
                    <span>Detected Issues ({flags.length})</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 mt-1">
                    {flags.map((flag, i) => (
                      <div
                        key={i}
                        className={`flex items-center italic gap-1.5 text-[8px] ${
                          flag.severity === "critical"
                            ? "text-red-600"
                            : flag.severity === "high"
                            ? "text-orange-600"
                            : "text-yellow-600"
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{flag.label}</span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <p className="text-[10px] text-green-600 italic">No issues detected</p>
              )}
            </div>
          </div>
        )}

        {/* GoPlus Attribution */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
          <span className="text-[8px] text-gray-400 italic">
            Powered by GoPlus
          </span>
          <a
            href="https://gopluslabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            gopluslabs.io
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
});
