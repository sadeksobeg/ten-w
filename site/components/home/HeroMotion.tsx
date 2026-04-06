"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
};

export function HeroMotion({ children }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let ctx: { revert: () => void } | undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      const nodes = root.current?.querySelectorAll(".hero-animate");
      if (!nodes?.length) return;
      ctx = gsap.context(() => {
        gsap.from(nodes, {
          opacity: 0,
          y: 20,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
        });
      }, root);
    })();

    return () => ctx?.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}
