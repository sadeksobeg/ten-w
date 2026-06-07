"use client";

import { useEffect, useState } from "react";

export type HallQuality = {
  dpr: [number, number];
  shadows: boolean;
  antialias: boolean;
  particleCount: number;
  reducedMotion3D: boolean;
  isMobile: boolean;
};

export function useHallQuality(reducedMotion3D: boolean): HallQuality {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return {
    dpr: isMobile ? [1, 1.25] : [1, 1.5],
    shadows: !isMobile,
    antialias: !isMobile,
    particleCount: reducedMotion3D ? 0 : isMobile ? 40 : 80,
    reducedMotion3D,
    isMobile,
  };
}
