"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "@/components/ui/button";
import { DOMAIN_URL } from "@/config/constants";

export function ShareScoreButton() {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (!address) return;

    setIsSharing(true);

    const shareUrl = `${DOMAIN_URL}/score?address=${address}`;
    const ogImageUrl = `${DOMAIN_URL}/api/og/score?address=${address}`;

    // Try Farcaster composeCast first, fallback to clipboard
    try {
      await sdk.actions.composeCast({
        text: "Check out my Social Score Hub!",
        embeds: [shareUrl, ogImageUrl] as [string, string],
      });
      setIsSharing(false);
      return;
    } catch {
      // Not in Farcaster or composeCast failed - fallback to clipboard
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Final fallback: prompt user
      window.prompt("Copy this link:", shareUrl);
    }

    setIsSharing(false);
  }, [address]);

  if (!address) return null;

  return (
    <Button
      onClick={handleShare}
      size="sm"
      className="rounded-full bg-transparent hover:bg-gray-200 font-medium text-[10px] text-black/70 italic"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="size-3.5" />
          Cast Score
        </>
      )}
    </Button>
  );
}
