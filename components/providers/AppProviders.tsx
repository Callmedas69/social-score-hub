"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { wagmiConfig } from "@/config/wagmi";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Signal app is ready - dismisses splash screen
        sdk.actions.ready();
        // Enable native back navigation for Next.js routing
        await sdk.back.enableWebNavigation();
        setIsReady(true);
      } catch (error) {
        // Not in Farcaster context, still render app
        console.log("Not in Farcaster Mini App context");
        setIsReady(true);
      }
    };

    initFarcaster();
  }, []);

  // Show nothing while initializing (splash screen shows in Farcaster)
  if (!isReady) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
