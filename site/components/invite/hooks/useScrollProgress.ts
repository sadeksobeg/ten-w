"use client";

import { useEffect, useState } from "react";

export function useScrollProgress(enabled = true): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, scrollTop / height) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return progress;
}
