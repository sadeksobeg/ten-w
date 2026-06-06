"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Star = {
  x: number;
  y: number;
  depth: number;
  size: number;
  opacity: number;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export function StarfieldCanvas() {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let shooting: ShootingStar | null = null;
    let nextShoot = performance.now() + 8000 + Math.random() * 7000;
    let raf = 0;
    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 2,
        depth: 0.2 + Math.random() * 0.8,
        size: Math.random() * 1.2 + 0.3,
        opacity: 0.2 + Math.random() * 0.6,
      }));
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    function frame(now: number) {
      if (!running || document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      const parallax = scrollRef.current * 0.05;

      for (const s of stars) {
        const y = ((s.y - parallax * s.depth) % (h * 2) + h * 2) % (h * 2) - h * 0.2;
        ctx!.fillStyle = `rgba(255,255,255,${s.opacity * s.depth})`;
        ctx!.fillRect(s.x, y, s.size, s.size);
      }

      if (now >= nextShoot) {
        shooting = {
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: 6 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 0,
        };
        nextShoot = now + 8000 + Math.random() * 7000;
      }

      if (shooting) {
        shooting.life += 1;
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        const grad = ctx!.createLinearGradient(
          shooting.x,
          shooting.y,
          shooting.x - 80,
          shooting.y - 30,
        );
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(shooting.x, shooting.y);
        ctx!.lineTo(shooting.x - 80, shooting.y - 30);
        ctx!.stroke();
        if (shooting.life > 40) shooting = null;
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
