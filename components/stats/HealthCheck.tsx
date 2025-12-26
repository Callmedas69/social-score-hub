"use client";

import { useWalletSecurity } from "@/hooks/useWalletSecurity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

function LoadingSkeleton() {
  return (
    <Card className="rounded-none">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
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

function RadialProgress({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
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
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
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
}

export function HealthCheck() {
  const { security, score, flags, isLoading, error } = useWalletSecurity();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="rounded-none">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            Failed to load security check. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // API returned null (failed silently)
  if (!security) {
    return (
      <Card className="rounded-none">
        <CardContent>
          <div className="flex items-center gap-2 text-gray-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Security</span>
            <span className="text-xs italic ml-auto">Unable to fetch</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-none">
      <CardContent>
        {/* Horizontal layout: Radial + Content */}
        <div className="flex items-center gap-3">
          <RadialProgress score={score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Security</span>
            </div>
            {/* Detected Issues - Collapsible */}
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
}
