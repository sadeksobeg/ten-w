"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function CustomCursor() {
  const reduced = useReducedMotion();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [onScreen, setOnScreen] = useState(false);
  const [coarse, setCoarse] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    let raf = 0;
    const syncCoarse = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCoarse(mq.matches));
    };
    syncCoarse();
    mq.addEventListener("change", syncCoarse);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", syncCoarse);
    };
  }, []);

  useEffect(() => {
    if (coarse || reduced) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setOnScreen(true);
    };
    const leave = () => setOnScreen(false);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [coarse, reduced]);

  if (coarse || reduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[200]"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        opacity: onScreen ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div className="h-9 w-9 rounded-full border border-gold/45 bg-gold/[0.08] shadow-[0_0_28px_rgba(201,160,97,0.4),inset_0_0_12px_rgba(255,215,0,0.12)] backdrop-blur-[2px]" />
    </div>
  );
}
