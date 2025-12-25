"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { Button } from "@/components/ui/button";

export function ShareScoreButton() {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (!address) return;

    setIsSharing(true);

    const baseUrl =
      process.env.NEXT_PUBLIC_DOMAIN_URL || window.location.origin;
    const shareUrl = `${baseUrl}/score?address=${address}`;

    // Check if we're in Farcaster context
    const isInFarcaster = typeof window !== "undefined" && window.parent !== window;

    if (isInFarcaster) {
      try {
        await sdk.actions.composeCast({
          text: "Check out my Social Score Hub!",
          embeds: [shareUrl] as [string],
        });
        setIsSharing(false);
        return;
      } catch (err) {
        console.log("composeCast failed:", err);
      }
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
