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

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Enable native back navigation for Next.js routing
        await sdk.back.enableWebNavigation();
      } catch (error) {
        console.log("Not in Farcaster Mini App context");
      }
    };

    initFarcaster();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
