"use client";

import { useRef, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import sdk from "@farcaster/miniapp-sdk";
import { gsap, useGSAP } from "@/lib/gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseCheckInCard, CeloCheckInCard, NFTMintCard } from "@/components/checkin";
import { Navigation } from "@/components/layout/Navigation";

export default function CheckInPage() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch - wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Signal Farcaster that the app is ready (dismiss splash screen)
  useEffect(() => {
    const initReady = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        // Not in Farcaster Mini App context
      }
    };
    initReady();
  }, []);

  useGSAP(() => {
    if (!mounted || !containerRef.current) return;

    // Set initial states
    gsap.set([titleRef.current, taglineRef.current, tabsRef.current], {
      opacity: 0,
      y: 30,
    });

    // Create timeline
    const tl = gsap.timeline({ delay: 0.1 });

    // Title fade up
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    }, 0);

    // Tagline fade up
    tl.to(taglineRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    }, 0.15);

    // Tabs section slide up
    tl.to(tabsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    }, 0.35);

  }, { scope: containerRef, dependencies: [mounted] });

  // Hydration loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <Navigation />
      </div>
    );
  }

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold text-gray-900">Connect Your Wallet</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Connect your wallet to start your daily check-in streak
          </p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="pt-6 pb-2 px-4">
        <h1
          ref={titleRef}
          className="text-3xl md:text-5xl font-extrabold tracking-tighter font-sans text-gray-900 text-center uppercase"
        >
          Hello Onchain
        </h1>
        <p
          ref={taglineRef}
          className="text-[10px] text-gray-500 text-center mt-1 italic"
        >
          Stack reputation. Catch drops.
        </p>
      </header>


      {/* Chain tabs */}
      <main className="flex-1 px-4 pb-20 pt-6">
        <div ref={tabsRef}>
          <Tabs defaultValue="base" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="base" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Base
              </TabsTrigger>
              <TabsTrigger value="celo" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Celo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="space-y-3">
              <BaseCheckInCard />
              <NFTMintCard />
            </TabsContent>
            <TabsContent value="celo">
              <CeloCheckInCard />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
