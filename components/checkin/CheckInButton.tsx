"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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

  // Derive phase from state (deterministic)
  const phase: CheckInPhase = (() => {
    if (isLoading) return "loading";
    if (isSuccess) return "success";
    if (isPending) return "pending";
    if (isConfirming) return "confirming";
    if (!isConnected) return "disconnected";
    if (!isCorrectChain) return "wrong-chain";
    if (canCheckIn) return "ready";
    return "cooldown";
  })();

  // Countdown effect
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

    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setSecondsRemaining(left);

      if (left <= 0) {
        clearInterval(interval);
        onCooldownCompleteRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
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
