"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";
import { sdk } from "@farcaster/miniapp-sdk";
import { CheckInButtonView } from "./CheckInButtonView";
import type { SupportedChainId } from "@/config/constants";

// Explicit phase - no ambiguity
export type CheckInPhase =
  | "loading"
  | "disconnected"
  | "wrong-chain"
  | "ready"
  | "pending"
  | "confirming"
  | "success"
  | "cooldown";

interface CheckInButtonProps {
  chainId: SupportedChainId;
  canCheckIn: boolean;
  timeRemaining: bigint;
  onSuccess?: () => void | Promise<void>;
  onCooldownComplete?: () => void;
  accentColor?: string;
  chainName?: string;
  isLoading?: boolean;
  textColor?: string;
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
  textColor = "text-white",
}: CheckInButtonProps) {
  // Wagmi hooks
  const { chain, isConnected } = useAccount();
  const { switchChain: doSwitchChain } = useSwitchChain();
  const {
    checkIn: doCheckIn,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  } = useCheckIn(chainId);

  const isCorrectChain = chain?.id === chainId;

  // Countdown state
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Guards
  const handledSuccessRef = useRef(false);
  const cooldownTargetRef = useRef<number | null>(null);

  // Callbacks stored in refs to avoid effect re-runs
  const onSuccessRef = useRef(onSuccess);
  const onCooldownCompleteRef = useRef(onCooldownComplete);
  onSuccessRef.current = onSuccess;
  onCooldownCompleteRef.current = onCooldownComplete;

  // Derive phase from state (deterministic, memoized)
  const phase: CheckInPhase = useMemo(() => {
    if (isLoading) return "loading";
    if (isSuccess) return "success";
    if (isPending) return "pending";
    if (isConfirming) return "confirming";
    if (!isConnected) return "disconnected";
    if (!isCorrectChain) return "wrong-chain";
    if (canCheckIn) return "ready";
    return "cooldown";
  }, [isLoading, isSuccess, isPending, isConfirming, isConnected, isCorrectChain, canCheckIn]);

  // Countdown effect - visibility-aware (pauses when tab hidden)
  useEffect(() => {
    if (canCheckIn || timeRemaining <= 0n) {
      setSecondsRemaining(0);
      cooldownTargetRef.current = null;
      return;
    }

    const initialSeconds = Number(timeRemaining);
    const targetTime = Date.now() + initialSeconds * 1000;
    cooldownTargetRef.current = targetTime;
    setSecondsRemaining(initialSeconds);

    let interval: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const left = Math.max(0, Math.ceil((cooldownTargetRef.current! - Date.now()) / 1000));
      setSecondsRemaining(left);
      if (left <= 0) {
        if (interval) clearInterval(interval);
        interval = null;
        onCooldownCompleteRef.current?.();
      }
    };

    const startTimer = () => {
      if (interval) clearInterval(interval);
      tick(); // Immediate update
      interval = setInterval(tick, 1000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (interval) clearInterval(interval);
        interval = null;
      } else {
        // Tab became visible - recalculate and restart
        const left = Math.max(0, Math.ceil((cooldownTargetRef.current! - Date.now()) / 1000));
        setSecondsRemaining(left);
        if (left > 0) {
          startTimer();
        } else {
          onCooldownCompleteRef.current?.();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (!document.hidden) {
      startTimer();
    }

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [canCheckIn, timeRemaining]);

  // Success effect
  useEffect(() => {
    if (!isSuccess || handledSuccessRef.current) return;
    handledSuccessRef.current = true;

    let cancelled = false;

    // Haptic feedback
    try {
      sdk.haptics.notificationOccurred("success");
    } catch {
      // Silently fail if not in Farcaster context
    }

    const handleSuccess = async () => {
      try {
        await onSuccessRef.current?.();
        if (!cancelled) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (err) {
        console.error("[CheckIn] onSuccess callback failed:", err);
      } finally {
        if (!cancelled) {
          reset();
          handledSuccessRef.current = false;
        }
      }
    };

    handleSuccess();

    return () => {
      cancelled = true;
    };
  }, [isSuccess, reset]);

  // Actions
  const handleCheckIn = useCallback(() => {
    reset();
    doCheckIn();
  }, [doCheckIn, reset]);

  const handleSwitchChain = useCallback(() => {
    doSwitchChain?.({ chainId });
  }, [doSwitchChain, chainId]);

  return (
    <CheckInButtonView
      phase={phase}
      secondsRemaining={secondsRemaining}
      chainName={chainName}
      accentColor={accentColor}
      textColor={textColor}
      error={error}
      onCheckIn={handleCheckIn}
      onSwitchChain={handleSwitchChain}
    />
  );
}
