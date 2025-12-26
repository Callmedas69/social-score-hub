"use client";

import { useRef, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BaseCheckInCard, CooldownTimer } from "@/components/checkin";
import { Navigation } from "@/components/layout/Navigation";

gsap.registerPlugin(useGSAP);

export default function CheckInPage() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch - wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted || !containerRef.current) return;

    // Set initial states
    gsap.set([titleRef.current, taglineRef.current, cardRef.current], {
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


    // Card slide up
    tl.to(cardRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    }, 0.45);

  }, { scope: containerRef, dependencies: [mounted] });

  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm animate-pulse">Connecting wallet...</p>
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


      {/* Chain cards */}
      <main ref={cardRef} className="flex-1 px-4 pb-20 space-y-3 pt-8">
        <BaseCheckInCard />
      </main>

      <Navigation />
    </div>
  );
}
