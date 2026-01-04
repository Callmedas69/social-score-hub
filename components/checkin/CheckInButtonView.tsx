"use client";

import { memo, useRef, useMemo } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatTimeRemaining, getUserFriendlyError } from "@/lib/utils";
import type { CheckInPhase } from "./CheckInButton";

// AnimatedCheckmark (unchanged, already good)
const AnimatedCheckmark = memo(function AnimatedCheckmark({
  color = "#fff",
}: {
  color?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="inline-block ml-2"
    >
      <path
        ref={pathRef}
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

interface CheckInButtonViewProps {
  phase: CheckInPhase;
  secondsRemaining: number;
  chainName: string;
  accentColor: string;
  textColor: string;
  error: Error | null;
  onCheckIn: () => void;
  onSwitchChain: () => void;
}

export const CheckInButtonView = memo(function CheckInButtonView({
  phase,
  secondsRemaining,
  chainName,
  accentColor,
  textColor,
  error,
  onCheckIn,
  onSwitchChain,
}: CheckInButtonViewProps) {
  const bgStyle = useMemo(
    () => ({ backgroundColor: accentColor }),
    [accentColor]
  );
  const switchStyle = useMemo(
    () => ({
      borderColor: accentColor,
      backgroundColor: `${accentColor}15`,
    }),
    [accentColor]
  );

  // Pure render based on phase
  switch (phase) {
    case "loading":
      return <div className="h-11 bg-gray-100 animate-pulse rounded" />;

    case "disconnected":
      return (
        <button
          disabled
          className="w-full h-11 bg-gray-100 text-gray-400 font-display cursor-not-allowed"
        >
          Connect wallet
        </button>
      );

    case "success":
      return (
        <button
          disabled
          className={`w-full h-11 ${textColor} font-display flex items-center justify-center`}
          style={bgStyle}
        >
          {chainName} morning
          <AnimatedCheckmark />
        </button>
      );

    case "pending":
      return (
        <button
          disabled
          className={`w-full h-11 ${textColor} opacity-70 font-display`}
          style={bgStyle}
        >
          Waiting for signature...
        </button>
      );

    case "confirming":
      return (
        <button
          disabled
          className={`w-full h-11 ${textColor} opacity-70 font-display`}
          style={bgStyle}
        >
          Confirming on-chain...
        </button>
      );

    case "wrong-chain":
      return (
        <div className="w-full">
          <button
            onClick={onSwitchChain}
            className="w-full h-11 text-black border-2 font-display transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={switchStyle}
          >
            Switch to {chainName}
          </button>
          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {getUserFriendlyError(error)}
            </p>
          )}
        </div>
      );

    case "ready":
      return (
        <div className="w-full">
          <button
            onClick={onCheckIn}
            className={`w-full h-11 ${textColor} font-display uppercase transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]`}
            style={bgStyle}
          >
            Hello {chainName}
          </button>
          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {getUserFriendlyError(error)}
            </p>
          )}
        </div>
      );

    case "cooldown":
      return (
        <div className="w-full">
          <p className="text-xs text-gray-500 text-center mb-1">
            Checked in today ✓
          </p>
          <button
            disabled
            className="w-full h-11 bg-gray-100 text-gray-400 font-display cursor-not-allowed"
          >
            {formatTimeRemaining(secondsRemaining)}
          </button>
        </div>
      );
  }
});
