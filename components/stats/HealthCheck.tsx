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
import { useState } from "react";

function LoadingSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

export function HealthCheck() {
  const { security, score, flags, isLoading, error } = useWalletSecurity();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card>
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
      <Card className="gap-2">
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            Security
            <span className="text-sm text-gray-400">—</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs italic">Unable to fetch security data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-2">
      <CardHeader className="pb-0">
        <CardTitle className="text-base flex items-center gap-2 pb-0 mb-0">
          <Shield className="w-4 h-4" />
          Security
          <span className={`text-sm font-semibold ${getScoreTextColor(score)}`}>
              {score}/100
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Security Score Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Detected Issues - Collapsible */}
        {flags.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-[10px] text-gray-700 hover:text-gray-900 italic">
              <span>Detected Issues ({flags.length})</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5">
              {flags.map((flag, i) => (
                <div
                  key={i}
                  className={`flex items-center italic gap-2 py-1 text-[10px] ${
                    flag.severity === "critical"
                      ? "text-red-600"
                      : flag.severity === "high"
                      ? "text-orange-600"
                      : "text-yellow-600"
                  }`}
                >
                  <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                  <span>{flag.label}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* GoPlus Attribution */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
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
