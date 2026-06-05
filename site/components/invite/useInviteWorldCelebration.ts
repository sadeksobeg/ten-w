"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "framer-motion";

export function useInviteWorldCelebration(active: boolean) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reduceMotion) return;

    const colors = ["#e8c872", "#f5dfa0", "#9d8cff", "#3ee8b8", "#ffffff"];

    const burst = (delay = 0) => {
      window.setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 110,
          origin: { y: 0.5, x: 0.5 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.6 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.6 },
          colors,
          disableForReducedMotion: true,
        });
      }, delay);
    };

    burst(0);
    burst(450);
    burst(900);
  }, [active, reduceMotion]);
}
