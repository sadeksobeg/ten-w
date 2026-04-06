"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import heroAnimation from "@/data/hero-lottie.json";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  className?: string;
};

/**
 * Lightweight hero accent: bundled JSON (no /lottie/hero.json fetch → no 404 in console).
 * Replace `data/hero-lottie.json` with your own Lottie export when ready.
 */
export function HeroLottie({ className = "" }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) return null;

  return (
    <div className={`mx-auto max-w-sm ${className}`} aria-hidden>
      <Lottie
        animationData={heroAnimation}
        loop
        className="h-48 w-full"
      />
    </div>
  );
}
