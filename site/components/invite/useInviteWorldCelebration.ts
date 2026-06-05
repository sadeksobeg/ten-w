"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "framer-motion";

export function useInviteWorldCelebration(active: boolean) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reduceMotion) return;

    const burst = () => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.55, x: 0.5 },
        colors: ["#7b6fff", "#00e5a0", "#e4b84d", "#ffffff"],
        disableForReducedMotion: true,
      });
    };

    burst();
    const t = window.setTimeout(burst, 400);
    return () => window.clearTimeout(t);
  }, [active, reduceMotion]);
}
