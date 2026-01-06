"use client";

import { memo, useRef, useMemo, useCallback } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatTimeRemaining, getUserFriendlyError } from "@/lib/utils";
import type { NFTMintPhase } from "@/hooks/useNFTMintController";

// AnimatedCheckmark (same pattern as CheckInButtonView)
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

interface NFTMintButtonViewProps {
  phase: NFTMintPhase;
  secondsRemaining: number;
  chainName: string;
  accentColor: string;
  textColor?: string;
  error: Error | null;
  mintPrice: bigint | undefined;
  onMint: () => void;
  onSwitchChain: () => void;
}

export const NFTMintButtonView = memo(function NFTMintButtonView({
  phase,
  secondsRemaining,
  chainName,
  accentColor,
  textColor = "text-white",
  error,
  mintPrice,
  onMint,
  onSwitchChain,
}: NFTMintButtonViewProps) {
  const clickGuardRef = useRef(false);

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

  // Debounced click handlers to prevent double-click
  const handleMint = useCallback(() => {
    if (clickGuardRef.current) return;
    clickGuardRef.current = true;
    onMint();
    // Reset guard after a short delay (phase change should handle actual disable)
    setTimeout(() => { clickGuardRef.current = false; }, 1000);
  }, [onMint]);

  const handleSwitchChain = useCallback(() => {
    if (clickGuardRef.current) return;
    clickGuardRef.current = true;
    onSwitchChain();
    setTimeout(() => { clickGuardRef.current = false; }, 1000);
  }, [onSwitchChain]);

  // Pure render based on phase
  switch (phase) {
    case "loading":
      return <div className="h-11 bg-gray-100 animate-pulse" />;

    case "success":
      return (
        <button
          disabled
          className={`w-full h-11 ${textColor} font-display flex items-center justify-center`}
          style={bgStyle}
        >
          NFT is yours!
          <AnimatedCheckmark color={textColor === "text-gray-900" ? "#111827" : "#fff"} />
        </button>
      );

    case "pending":
      return (
        <button
          disabled
          className={`w-full h-11 ${textColor} opacity-70 font-display`}
          style={bgStyle}
        >
          Confirm in wallet...
        </button>
      );

    case "confirming":
      return (
        <button
          disabled
          className={`w-full h-11 ${textColor} opacity-70 font-display`}
          style={bgStyle}
        >
          Almost there...
        </button>
      );

    case "wrong-chain":
      return (
        <div className="w-full">
          <button
            onClick={handleSwitchChain}
            className="w-full h-11 text-black border-2 font-display transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={switchStyle}
          >
            Hop to {chainName}
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
            onClick={handleMint}
            disabled={!mintPrice}
            className={`w-full h-11 ${textColor} font-display uppercase transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
            style={bgStyle}
          >
            Mint NFT
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
        <button
          disabled
          className="w-full h-11 bg-gray-100 text-gray-400 font-display cursor-not-allowed"
        >
          {formatTimeRemaining(secondsRemaining)}
        </button>
      );
  }
});
