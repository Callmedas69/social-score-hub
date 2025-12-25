"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";
import { useCanCheckIn } from "@/hooks/useCanCheckIn";
import { base } from "wagmi/chains";

export function CooldownTimer() {
  const { status } = useCanCheckIn(base.id);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with status
  useEffect(() => {
    if (status?.timeRemaining) {
      setRemaining(Number(status.timeRemaining));
    }
  }, [status?.timeRemaining]);

  // Single interval that doesn't recreate
  const shouldRun = remaining > 0;
  useEffect(() => {
    if (!shouldRun) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shouldRun]);

  // Don't show if no cooldown
  if (remaining <= 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
      <Clock className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-600">Next reset in</span>
      <span className="text-sm font-mono font-medium text-gray-900">
        {formatTimeRemaining(remaining)}
      </span>
    </div>
  );
}
