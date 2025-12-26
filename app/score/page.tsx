"use client";

import { useRef, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { SocialScores } from "@/components/stats/SocialScores";
import { ShareScoreButton } from "@/components/stats/ShareScoreButton";
import { Navigation } from "@/components/layout/Navigation";

gsap.registerPlugin(useGSAP);

export default function ScorePage() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted || !isConnected) return;

      // Respect reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        gsap.set(".score-title, .title-logo, .score-description, .score-card, .score-note", {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
          duration: 0.6,
        },
      });

      // Animate title
      tl.fromTo(
        ".score-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0 }
      );

      // Logo pop with spin
      tl.fromTo(
        ".title-logo",
        { opacity: 0, scale: 0, rotate: -180 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.6"
      );

      // Animate description
      tl.fromTo(
        ".score-description",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.3"
      );

      // Stagger animate cards
      tl.fromTo(
        ".score-card",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: {
            each: 0.08,
            from: "start",
          },
          duration: 0.5,
        },
        "-=0.2"
      );

      // Animate footer note
      tl.fromTo(
        ".score-note",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        "-=0.2"
      );
    },
    { scope: containerRef, dependencies: [mounted, isConnected] }
  );

  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-400 animate-pulse">Connecting wallet...</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-6 pb-24 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 score-title">
            <Image
              src="/social_score_hub_logo.svg"
              alt="Social Score Hub"
              width={28}
              height={28}
              className="title-logo opacity-0 -mr-2 -z-5"
            />
            <h1 className="text-2xl font-bold font-sans text-gray-900">
              SOCIAL SCORE
            </h1>
          </div>
          <ShareScoreButton />
        </div>

        <SocialScores />
      </main>

      <Navigation />
    </div>
  );
}
