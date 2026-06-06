"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/components/invite/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

export function MagneticCursor() {
  const isDesktop = useMediaQuery("(min-width: 1024px) and (pointer: fine)");
  const reducedMotion = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const hoveringButton = useRef(false);

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    const trails: HTMLDivElement[] = [];
    for (let i = 0; i < 5; i++) {
      const el = document.createElement("div");
      el.className = "invite-cursor-trail";
      el.style.opacity = String(0.35 - i * 0.06);
      document.body.appendChild(el);
      trails.push(el);
    }
    trailsRef.current = trails;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      hoveringButton.current = Boolean(
        t?.closest("button, a.invite-cta-ceremony, .invite-download-btn"),
      );
    };

    let raf = 0;
    const trailPos = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));

    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top = `${pos.current.y}px`;
        dotRef.current.classList.toggle("invite-cursor-ring", hoveringButton.current);
      }

      trailPos.forEach((tp, i) => {
        const prev = i === 0 ? pos.current : trailPos[i - 1];
        tp.x += (prev.x - tp.x) * 0.25;
        tp.y += (prev.y - tp.y) * 0.25;
        const el = trails[i];
        if (el) {
          el.style.left = `${tp.x}px`;
          el.style.top = `${tp.y}px`;
        }
      });

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.body.style.cursor = "none";
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.body.style.cursor = "";
      trails.forEach((el) => el.remove());
    };
  }, [isDesktop, reducedMotion]);

  if (!isDesktop || reducedMotion) return null;

  return <div ref={dotRef} className="invite-cursor-dot hidden lg:block" aria-hidden />;
}
