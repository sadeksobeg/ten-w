"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = { children: React.ReactNode };

export function SmoothScroll({ children }: Props) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let destroyed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { default: ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      if (destroyed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        touchMultiplier: 1.6,
      });

      lenis.on("scroll", ScrollTrigger.update);

      const ticker = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      const teardown = () => {
        gsap.ticker.remove(ticker);
        lenis.destroy();
        ScrollTrigger.refresh();
      };

      if (destroyed) teardown();
      else cleanup = teardown;
    })();

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [reduced]);

  return <>{children}</>;
}
