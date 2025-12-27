"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function CountUp({ end, duration = 1, delay = 0, className = "" }: CountUpProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef({ value: 0 });
  const prevEndRef = useRef<number | null>(null);
  const hasInitialAnimated = useRef(false);

  useGSAP(() => {
    // Skip if end hasn't changed
    if (prevEndRef.current === end) {
      return;
    }

    // If end is 0, just set it without animation
    if (end === 0) {
      if (displayRef.current) {
        displayRef.current.textContent = "0";
      }
      valueRef.current.value = 0;
      prevEndRef.current = end;
      return;
    }

    // Initial animation with delay
    if (!hasInitialAnimated.current) {
      hasInitialAnimated.current = true;
      gsap.to(valueRef.current, {
        value: end,
        duration,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          if (displayRef.current) {
            displayRef.current.textContent = Math.round(valueRef.current.value).toString();
          }
        },
      });
    } else {
      // Subsequent updates - animate from current to new (no delay)
      gsap.to(valueRef.current, {
        value: end,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
          if (displayRef.current) {
            displayRef.current.textContent = Math.round(valueRef.current.value).toString();
          }
        },
      });
    }

    prevEndRef.current = end;
    // Note: duration and delay are intentionally excluded as they're static props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  return <span ref={displayRef} className={className}>0</span>;
}
