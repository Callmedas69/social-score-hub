import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useNFTMint } from "./useNFTMint";
import { sdk } from "@farcaster/miniapp-sdk";
import type { SupportedChainId } from "@/config/constants";

// Explicit phase - no ambiguity
export type NFTMintPhase =
  | "loading" // Parent data loading
  | "wrong-chain" // User on wrong chain
  | "ready" // Can mint
  | "pending" // Awaiting wallet signature
  | "confirming" // Transaction submitted, awaiting confirmation
  | "success" // Confirmed, showing success
  | "cooldown"; // In cooldown period

export interface NFTMintControllerState {
  phase: NFTMintPhase;
  secondsRemaining: number;
  error: Error | null;
  mintPrice: bigint | undefined;
}

export interface NFTMintControllerActions {
  mint: () => void;
  switchChain: () => void;
}

export interface UseNFTMintControllerProps {
  chainId: SupportedChainId;
  canMint: boolean;
  timeRemaining: bigint;
  isLoading: boolean;
  onSuccess?: () => void | Promise<void>;
  onCooldownComplete?: () => void;
}

export function useNFTMintController({
  chainId,
  canMint,
  timeRemaining,
  isLoading,
  onSuccess,
  onCooldownComplete,
}: UseNFTMintControllerProps): [NFTMintControllerState, NFTMintControllerActions] {
  const { chain } = useAccount();
  const { switchChain: doSwitchChain } = useSwitchChain();
  const {
    mint: doMint,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
    mintPrice,
  } = useNFTMint(chainId);

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

  // Derive phase from state (deterministic, memoized)
  const phase: NFTMintPhase = useMemo(() => {
    if (isLoading) return "loading";
    if (isSuccess) return "success";
    if (isPending) return "pending";
    if (isConfirming) return "confirming";
    if (!isCorrectChain) return "wrong-chain";
    if (canMint) return "ready";
    return "cooldown";
  }, [isLoading, isSuccess, isPending, isConfirming, isCorrectChain, canMint]);

  // Countdown effect - depends on props, not state
  useEffect(() => {
    if (canMint || timeRemaining <= 0n) {
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
  }, [canMint, timeRemaining]);

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
        }
      }
    };

    handleSuccess();

    return () => {
      cancelled = true;
      // Reset guard only on cleanup (when isSuccess changes or unmount)
      handledSuccessRef.current = false;
    };
  }, [isSuccess, reset]);

  // Actions
  const mint = useCallback(() => {
    doMint();
  }, [doMint]);

  const switchChain = useCallback(() => {
    doSwitchChain?.({ chainId });
  }, [doSwitchChain, chainId]);

  return [
    { phase, secondsRemaining, error, mintPrice },
    { mint, switchChain },
  ];
}
