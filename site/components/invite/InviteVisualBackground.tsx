"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  visible?: boolean;
};

function createStars(container: HTMLElement) {
  container.replaceChildren();
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "invite-star";
    const size = Math.random() * 2 + 0.5;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --duration: ${Math.random() * 4 + 2}s;
      --delay: ${Math.random() * 5}s;
      --min-opacity: ${Math.random() * 0.2 + 0.05};
      --max-opacity: ${Math.random() * 0.4 + 0.2};
    `;
    container.appendChild(star);
  }
}

export function InviteVisualBackground({ visible = true }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current || reducedMotion) return;
    createStars(starsRef.current);
  }, [reducedMotion]);

  if (!visible) return null;

  return (
    <>
      <div
        className={`invite-aurora-container ${visible ? "is-visible" : ""}`}
        aria-hidden
      >
        <div className="invite-aurora-1" />
        <div className="invite-aurora-2" />
        <div className="invite-aurora-3" />
      </div>
      {!reducedMotion ? (
        <div ref={starsRef} className="invite-stars" aria-hidden />
      ) : null}
    </>
  );
}
