"use client";

import { useCheckInController } from "@/hooks/useCheckInController";
import { CheckInButtonView } from "./CheckInButtonView";
import type { SupportedChainId } from "@/config/constants";

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
  const [state, actions] = useCheckInController({
    chainId,
    canCheckIn,
    timeRemaining,
    isLoading,
    onSuccess,
    onCooldownComplete,
  });

  return (
    <CheckInButtonView
      phase={state.phase}
      secondsRemaining={state.secondsRemaining}
      chainName={chainName}
      accentColor={accentColor}
      textColor={textColor}
      error={state.error}
      onCheckIn={actions.checkIn}
      onSwitchChain={actions.switchChain}
    />
  );
}
