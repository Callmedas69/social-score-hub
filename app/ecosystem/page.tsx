"use client";

import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { gsap, useGSAP } from "@/lib/gsap";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useFarcasterActions } from "@/hooks/useFarcasterActions";

function AppLogo({ src, name }: { src: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={40}
      height={40}
      className="w-full h-full object-contain"
      onError={() => setHasError(true)}
    />
  );
}

const ecosystemApps = [
  {
    name: "Baseapp",
    description: "The official Base social app - connect, share, and explore the Base ecosystem",
    url: "https://base.app/invite/friends/K6F4YLVP",
    logo: "/ecosystem/baseapp.png",
  },
  {
    name: "Farcaster",
    description: "A decentralized social network built on Ethereum - own your identity and connections",
    url: "https://farcaster.xyz/~/code/WX0PD8",
    logo: "/ecosystem/farcaster.png",
  },
  {
    name: "Zora",
    description: "Zora turns social posts into tradeable onchain objects, where likes become mints, posts become markets, and culture stays permissionless.",
    url: "https://zora.co/invite/0xdas",
    logo: "/ecosystem/zora.png",
  },
];

export default function EcosystemPage() {
  const { isConnected } = useAccount();
  const containerRef = useRef<HTMLDivElement>(null);
  const { openUrl } = useFarcasterActions();

  useGSAP(
    () => {
      if (!isConnected) return;

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
          duration: 0.6,
        },
      });

      tl.fromTo(
        ".ecosystem-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0 }
      );

      tl.fromTo(
        ".ecosystem-description",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.3"
      );

      tl.fromTo(
        ".ecosystem-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
        },
        "-=0.2"
      );
    },
    { scope: containerRef, dependencies: [isConnected] }
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500">Connecting wallet...</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-6 pb-24 max-w-md mx-auto w-full">
        <h1 className="ecosystem-title text-2xl font-bold font-sans text-gray-900 opacity-0">
          BASE ECOSYSTEM
        </h1>

        <p className="ecosystem-description text-[10px] italic text-gray-500 mt-2 mb-6 opacity-0">
          Explore apps and protocols built on Base
        </p>

        <div className="space-y-3">
          {ecosystemApps.map((app) => (
            <button
              key={app.name}
              onClick={() => openUrl(app.url)}
              className="ecosystem-card opacity-0 block w-full text-left"
            >
              <Card className="rounded-none hover:shadow-md transition-shadow cursor-pointer py-0">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    <AppLogo src={app.logo} name={app.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{app.name}</h3>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="text-[8px] italic text-gray-500 mt-0.5 line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </main>

      <Navigation />
    </div>
  );
}
