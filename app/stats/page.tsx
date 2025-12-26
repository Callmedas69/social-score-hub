"use client";

import { useRef, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { UserCard } from "@/components/stats/UserCard";
import { HealthCheck } from "@/components/stats/HealthCheck";
import { ActivityDashboard } from "@/components/stats/ActivityDashboard";
import { Navigation } from "@/components/layout/Navigation";

gsap.registerPlugin(useGSAP);

export default function StatsPage() {
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
        gsap.set(".stats-title, .stats-section", {
          opacity: 1,
          y: 0,
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
        ".stats-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0 }
      );

      // Stagger animate sections
      tl.fromTo(
        ".stats-section",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.5,
        },
        "-=0.3"
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
      <main className="flex-1 p-6 pb-24 max-w-md mx-auto w-full space-y-6">
        <h1 className="stats-title text-2xl font-extrabold tracking-tighter text-gray-900 uppercase font-sans opacity-0">
          Wallet Info
        </h1>

        {/* User Card */}
        <div className="stats-section opacity-0">
          <UserCard />
        </div>

        {/* Health Check */}
        <div className="stats-section opacity-0">
          <HealthCheck />
        </div>

        {/* Activity Dashboard */}
        <div className="stats-section opacity-0">
          <ActivityDashboard />
        </div>
      </main>

      <Navigation />
    </div>
  );
}
