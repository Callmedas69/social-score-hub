"use client";

import { useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function useFarcasterActions() {
  const openUrl = useCallback(async (url: string) => {
    try {
      await sdk.actions.openUrl(url);
    } catch {
      // Fallback: open in new tab for non-Farcaster context
      window.open(url, "_blank");
    }
  }, []);

  const openMiniApp = useCallback(async (url: string) => {
    try {
      await sdk.actions.openMiniApp({ url });
    } catch (error) {
      console.log("openMiniApp failed:", error);
    }
  }, []);

  const addMiniApp = useCallback(async () => {
    try {
      await sdk.actions.addMiniApp();
      return true;
    } catch {
      // RejectedByUser or InvalidDomainManifestJson
      return false;
    }
  }, []);

  return { openUrl, openMiniApp, addMiniApp };
}
