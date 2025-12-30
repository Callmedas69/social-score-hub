"use client";

import { memo, useEffect, useState, useRef } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { gsap, useGSAP } from "@/lib/gsap";
import { useNFTMint } from "@/hooks/useNFTMint";
import { formatTimeRemaining, getUserFriendlyError } from "@/lib/utils";
import { sdk } from "@farcaster/miniapp-sdk";

// Animated checkmark SVG component
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

interface NFTMintButtonProps {
  canMint: boolean;
  timeRemaining: bigint;
  mintPrice?: bigint;
  onSuccess?: () => void;
  onCooldownComplete?: () => void;
  isLoading?: boolean;
}

export function NFTMintButton({
  canMint,
  timeRemaining,
  mintPrice,
  onSuccess,
  onCooldownComplete,
  isLoading = false,
}: NFTMintButtonProps) {
  const { chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { mint, isPending, isConfirming, isSuccess, error, reset } =
    useNFTMint();

  const [remaining, setRemaining] = useState(Number(timeRemaining));
  const [justMinted, setJustMinted] = useState(false);
  const isCorrectChain = chain?.id === base.id;

  // Refs for callbacks
  const onSuccessRef = useRef(onSuccess);
  const onCooldownCompleteRef = useRef(onCooldownComplete);
  onSuccessRef.current = onSuccess;
  onCooldownCompleteRef.current = onCooldownComplete;

  useEffect(() => {
    setRemaining(Number(timeRemaining));
  }, [timeRemaining]);

  // Reset justMinted when canMint becomes false
  useEffect(() => {
    if (!canMint) {
      setJustMinted(false);
    }
  }, [canMint]);

  // Countdown timer
  useEffect(() => {
    if (canMint || remaining <= 0) return;

    const targetTime = Date.now() + remaining * 1000;

    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setRemaining(left);

      if (left <= 0) {
        clearInterval(interval);
        onCooldownCompleteRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canMint, remaining]);

  useEffect(() => {
    if (isSuccess) {
      setJustMinted(true);
      onSuccessRef.current?.();
      try {
        sdk.haptics.notificationOccurred("success");
      } catch {
        // Silently fail if not in Farcaster context
      }
      const timer = setTimeout(() => reset(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const handleClick = (action: "switch" | "mint") => {
    if (action === "switch") {
      switchChain?.({ chainId: base.id });
    } else {
      mint();
    }
  };


  const accentColor = "#0000FF"; // Base blue (matches CHAIN_CONFIG)

  // Loading state
  if (isLoading) {
    return <div className="h-11 bg-gray-100 animate-pulse" />;
  }

  // Success state
  if (isSuccess) {
    return (
      <button
        disabled
        className="w-full h-11 text-white font-display flex items-center justify-center"
        style={{ backgroundColor: accentColor }}
      >
        NFT Minted
        <AnimatedCheckmark />
      </button>
    );
  }

  // Processing state
  if (isPending || isConfirming) {
    return (
      <button
        disabled
        className="w-full h-11 text-white opacity-70 font-display"
        style={{ backgroundColor: accentColor }}
      >
        {isPending ? "Confirm..." : "Processing..."}
      </button>
    );
  }

  // Wrong chain
  if (!isCorrectChain) {
    return (
      <div className="w-full">
        <button
          onClick={() => handleClick("switch")}
          disabled={isSwitching}
          className="w-full h-11 text-black border-2 font-display transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          style={{
            borderColor: accentColor,
            backgroundColor: `${accentColor}15`,
          }}
        >
          {isSwitching ? "Switching..." : "Switch to Base"}
        </button>
        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">
            {getUserFriendlyError(error)}
          </p>
        )}
      </div>
    );
  }

  // Can mint
  if (canMint && !justMinted) {
    return (
      <div className="w-full">
        <button
          onClick={() => handleClick("mint")}
          disabled={!mintPrice}
          className="w-full h-11 text-white font-display uppercase transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
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
  }

  // After success, waiting for data refresh
  if (justMinted && remaining <= 0) {
    return <div className="h-11 bg-gray-100 animate-pulse" />;
  }

  // Cooldown
  return (
    <button
      disabled
      className="w-full h-11 bg-gray-100 text-gray-400 font-display cursor-not-allowed"
    >
      {formatTimeRemaining(remaining)}
    </button>
  );
}
