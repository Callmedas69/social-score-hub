import { useRef, useState, useEffect, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useCheckIn } from "./useCheckIn";
import { sdk } from "@farcaster/miniapp-sdk";
import type { SupportedChainId } from "@/config/constants";

// Explicit phase - no ambiguity
export type CheckInPhase =
  | "loading" // Parent data loading
  | "wrong-chain" // User on wrong chain
  | "ready" // Can check in
  | "pending" // Awaiting wallet signature
  | "confirming" // Transaction submitted, awaiting confirmation
  | "success" // Confirmed, showing success
  | "cooldown"; // In cooldown period

export interface CheckInControllerState {
  phase: CheckInPhase;
  secondsRemaining: number;
  error: Error | null;
}

export interface CheckInControllerActions {
  checkIn: () => void;
  switchChain: () => void;
}

export interface UseCheckInControllerProps {
  chainId: SupportedChainId;
  canCheckIn: boolean;
  timeRemaining: bigint;
  isLoading: boolean;
  onSuccess?: () => void | Promise<void>;
  onCooldownComplete?: () => void;
}

export function useCheckInController({
  chainId,
  canCheckIn,
  timeRemaining,
  isLoading,
  onSuccess,
  onCooldownComplete,
}: UseCheckInControllerProps): [CheckInControllerState, CheckInControllerActions] {
  const { chain } = useAccount();
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

  // Countdown state - single source of truth
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
    if (!isCorrectChain) return "wrong-chain";
    if (canCheckIn) return "ready";
    return "cooldown";
  })();

  // Countdown effect - depends on props, not state
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

  // Success effect - guarded, with cleanup
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
  const checkIn = useCallback(() => {
    doCheckIn();
  }, [doCheckIn]);

  const switchChain = useCallback(() => {
    doSwitchChain?.({ chainId });
  }, [doSwitchChain, chainId]);

  return [{ phase, secondsRemaining, error }, { checkIn, switchChain }];
}
