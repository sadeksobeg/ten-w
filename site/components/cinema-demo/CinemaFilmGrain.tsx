"use client";

import { useEffect, useRef } from "react";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import type { GrainIntensity } from "@/stores/cinema-demo-store";

const OPACITY: Record<GrainIntensity, number> = {
  boot: 0.05,
  splash: 0.03,
  normal: 0.02,
  dashboard: 0.01,
};

export function CinemaFilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainIntensity = useCinemaDemoStore((s) => s.grainIntensity);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let id = 0;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const img = ctx.createImageData(w, h);
      const alpha = Math.round(OPACITY[grainIntensity] * 255);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = alpha;
      }
      ctx.putImageData(img, 0, 0);
      id = window.setTimeout(() => requestAnimationFrame(loop), 50);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      clearTimeout(id);
    };
  }, [grainIntensity]);

  return <canvas ref={canvasRef} className="cinema-film-grain" aria-hidden />;
}
