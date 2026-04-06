"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * GSAP ScrollTrigger parallax for elements with `.js-parallax-slow`.
 */
export function HomeScrollEnhancements({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let ctx: { revert: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { default: ScrollTrigger }]) => {
        const el = root.current;
        if (!el) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>(".js-parallax-slow").forEach((node) => {
            gsap.fromTo(
              node,
              { y: 36 },
              {
                y: -36,
                ease: "none",
                scrollTrigger: {
                  trigger: node,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.15,
                },
              },
            );
          });
        }, el);
      },
    );

    return () => {
      ctx?.revert();
    };
  }, [reduced]);

  return <div ref={root}>{children}</div>;
}
