"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CircleChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sdk } from "@farcaster/miniapp-sdk";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Signal Farcaster that the app is ready to display
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

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      // Stagger title lines with dramatic reveal
      tl.fromTo(
        ".title-line",
        { opacity: 0, y: 60, rotateX: -40 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.12,
        }
      );

      // Logo pop with slight delay
      tl.fromTo(
        ".title-logo",
        { opacity: 0, scale: 0, rotate: -180 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.6"
      );

      // Tagline fade up
      tl.fromTo(
        ".home-tagline",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      );

      // CTA button
      tl.fromTo(
        ".home-cta",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.2"
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center p-6 max-w-md mx-auto w-full">
        {/* Centered content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Hero Title - Semantic single h1 with visual lines */}
          <h1 className="flex flex-col items-center select-none" style={{ perspective: "1000px" }}>
            {/* Line 1: S[logo]CIAL */}
            <span className="title-line opacity-0 text-5xl md:text-6xl font-bold font-sans text-gray-900 tracking-tighter leading-none flex items-center">
              S
              <Image
                src="/social_score_hub_logo.svg"
                alt="O"
                width={52}
                height={52}
                className="title-logo opacity-0 inline-block -mx-0.5 -z-5"
                priority
              />
              CIAL
            </span>
            {/* Line 2: SCORE */}
            <span className="title-line opacity-0 text-5xl md:text-6xl font-bold font-sans text-gray-900 tracking-tighter leading-none">
              SCORE
            </span>
            {/* Line 3: HUB */}
            <span className="title-line opacity-0 text-5xl md:text-6xl font-bold font-sans text-gray-900 tracking-tighter leading-none">
              HUB
            </span>
          </h1>

          {/* Tagline */}
          <p className="home-tagline flex flex-col font-display opacity-0 text-xs md:text-sm font-medium text-gray-500 mt-6 text-center tracking-tighter leading-none uppercase">
            <span>Not a score</span> <span>just the signals</span>
          </p>
        </div>

        {/* CTA Button */}
        <div className="home-cta opacity-0 pb-12">
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full px-8 transition-all bg-transparent text-black/30 italic duration-200 hover:gap-4 text-[10px]"
          >
            <Link href="/score">
              Your Signals
              <CircleChevronRight className="w-1 h-1" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
