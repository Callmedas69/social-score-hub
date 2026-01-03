"use client";

import { memo, useRef, useMemo } from "react";
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
  error,
  mintPrice,
  onMint,
  onSwitchChain,
}: NFTMintButtonViewProps) {
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
      return <div className="h-11 bg-gray-100 animate-pulse" />;

    case "success":
      return (
        <button
          disabled
          className="w-full h-11 text-white font-display flex items-center justify-center"
          style={bgStyle}
        >
          NFT Minted
          <AnimatedCheckmark />
        </button>
      );

    case "pending":
      return (
        <button
          disabled
          className="w-full h-11 text-white opacity-70 font-display"
          style={bgStyle}
        >
          Confirm...
        </button>
      );

    case "confirming":
      return (
        <button
          disabled
          className="w-full h-11 text-white opacity-70 font-display"
          style={bgStyle}
        >
          Processing...
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
            onClick={onMint}
            disabled={!mintPrice}
            className="w-full h-11 text-white font-display uppercase transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={bgStyle}
          >
            Mint DAO Token
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
