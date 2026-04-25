"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

type Props = {
  trigger?: string;
};

export function GrowthConfetti({ trigger }: Props) {
  useEffect(() => {
    if (!trigger) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const end = Date.now() + 900;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#c9a061", "#a855f7", "#ffffff"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ["#c9a061", "#a855f7", "#ffffff"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [trigger]);

  return null;
}
