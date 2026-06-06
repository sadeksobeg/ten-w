"use client";

import { useEffect, useState } from "react";

export function useParallax(enabled = true): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => setOffset(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return offset;
}
