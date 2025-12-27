"use client";

import { useRef, useEffect } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export function SplitText({ children, className = "", delay = 0 }: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useGSAP(() => {
    if (hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    const chars = containerRef.current.querySelectorAll(".char");
    const middle = Math.floor(chars.length / 2);

    // Set initial state
    gsap.set(chars, {
      opacity: 0,
      y: 20,
      rotateX: -90,
    });

    // Animate from center outward
    const timeline = gsap.timeline({ delay });

    chars.forEach((char, i) => {
      const distanceFromCenter = Math.abs(i - middle);
      timeline.to(
        char,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        distanceFromCenter * 0.03
      );
    });
  }, { scope: containerRef });

  // Split text into characters
  const chars = children.split("").map((char, i) => (
    <span
      key={i}
      className="char inline-block"
      style={{
        transformOrigin: "center bottom",
        perspective: "1000px"
      }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  return (
    <div ref={containerRef} className={className} style={{ perspective: "1000px" }}>
      {chars}
    </div>
  );
}
