"use client";

import { memo, useEffect, useState, useRef, useMemo } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCheckIn } from "@/hooks/useCheckIn";
import type { SupportedChainId } from "@/config/constants";
import { formatTimeRemaining } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

// Animated checkmark SVG component (memoized for performance)
const AnimatedCheckmark = memo(function AnimatedCheckmark({ color = "#fff" }: { color?: string }) {
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

interface CheckInButtonProps {
  chainId: SupportedChainId;
  canCheckIn: boolean;
  timeRemaining: bigint;
  onSuccess?: () => void;
  onCooldownComplete?: () => void;
  accentColor?: string;
  chainName?: string;
  isLoading?: boolean;
}

export function CheckInButton({
  chainId,
  canCheckIn,
  timeRemaining,
  onSuccess,
  onCooldownComplete,
  accentColor = "#000",
  chainName = "Chain",
  isLoading = false,
}: CheckInButtonProps) {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { checkIn, isPending, isConfirming, isSuccess, error, reset } =
    useCheckIn(chainId);

  const [remaining, setRemaining] = useState(Number(timeRemaining));
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const isCorrectChain = chain?.id === chainId;

  // Refs for callbacks to avoid effect re-runs
  const onSuccessRef = useRef(onSuccess);
  const onCooldownCompleteRef = useRef(onCooldownComplete);
  onSuccessRef.current = onSuccess;
  onCooldownCompleteRef.current = onCooldownComplete;

  useEffect(() => {
    setRemaining(Number(timeRemaining));
  }, [timeRemaining]);

  // Reset justCheckedIn when canCheckIn becomes false (parent updated)
  useEffect(() => {
    if (!canCheckIn) {
      setJustCheckedIn(false);
    }
  }, [canCheckIn]);

  useEffect(() => {
    if (canCheckIn) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCooldownCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [canCheckIn]);

  useEffect(() => {
    if (isSuccess) {
      setJustCheckedIn(true);
      onSuccessRef.current?.();
      const timer = setTimeout(() => reset(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  const handleClick = (action: "switch" | "checkIn") => {
    if (action === "switch") {
      switchChain?.({ chainId });
    } else {
      checkIn();
    }
  };

  const bgStyle = useMemo(
    () => ({ backgroundColor: accentColor }),
    [accentColor]
  );

  const switchButtonStyle = useMemo(
    () => ({
      borderColor: accentColor,
      backgroundColor: `${accentColor}15`,
    }),
    [accentColor]
  );

  const checkInButtonStyle = useMemo(
    () => ({
      backgroundColor: accentColor,
    }),
    [accentColor]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="h-8 bg-gray-100 animate-pulse" />
    );
  }

  // Success state with animated checkmark
  if (isSuccess) {
    return (
      <button
        disabled
        className="w-full h-8 text-white font-display flex items-center justify-center"
        style={bgStyle}
      >
        {chainName} morning
        <AnimatedCheckmark />
      </button>
    );
  }

  // Processing state
  if (isPending || isConfirming) {
    return (
      <button
        disabled
        className="w-full h-8 text-white opacity-70 font-display"
        style={bgStyle}
      >
        {isPending ? "Confirm..." : "Processing..."}
      </button>
    );
  }

  // Wrong chain - show switch button
  if (!isCorrectChain) {
    return (
      <div className="w-full">
        <button
          onClick={() => handleClick("switch")}
          className="w-full h-8 text-black border-2 font-display transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={switchButtonStyle}
        >
          Switch to {chainName}
        </button>
        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">
            {error.message || "Failed to switch chain"}
          </p>
        )}
      </div>
    );
  }

  // Can check in - show Hello button (but not if just checked in)
  if (canCheckIn && !justCheckedIn) {
    return (
      <div className="w-full">
        <button
          onClick={() => handleClick("checkIn")}
          className="w-full h-8 text-white font-display uppercase transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={checkInButtonStyle}
        >
          Hello {chainName}
        </button>
        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">
            {error.message || "Transaction failed"}
          </p>
        )}
      </div>
    );
  }

  // After success, waiting for parent data to refresh - show loading
  if (justCheckedIn && remaining <= 0) {
    return <div className="h-8 bg-gray-100 animate-pulse" />;
  }

  // Cooldown - show disabled state with countdown
  return (
    <button
      disabled
      className="w-full h-8 bg-gray-100 text-gray-400 font-display cursor-not-allowed"
    >
      {formatTimeRemaining(remaining)}
    </button>
  );
}
