"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FarcasterClient {
  added: boolean;
  platformType?: "web" | "mobile";
  clientFid: number;
}

interface FarcasterContextData {
  isInMiniApp: boolean;
  isLoading: boolean;
  user: FarcasterUser | null;
  client: FarcasterClient | null;
}

export function useFarcasterContext(): FarcasterContextData {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [client, setClient] = useState<FarcasterClient | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const miniAppStatus = await sdk.isInMiniApp();
        setIsInMiniApp(miniAppStatus);

        if (miniAppStatus) {
          const context = await sdk.context;
          setUser(context.user);
          setClient(context.client);
        }
      } catch (error) {
        console.log("Not in Farcaster Mini App context");
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, []);

  return { isInMiniApp, isLoading, user, client };
}
