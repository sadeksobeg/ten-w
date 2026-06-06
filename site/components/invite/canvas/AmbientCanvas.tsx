"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type ParticleType = "bokeh" | "sparkle" | "nebula";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: ParticleType;
};

const COLORS = {
  bokeh: ["#C9922A", "#E4B84D", "#F5E6C3", "#B07D2B"],
  sparkle: ["#FFFFFF", "#F5F0E8", "#E4B84D"],
  nebula: ["#6B21A8", "#A855F7", "#7C3AED", "#4C1D95"],
};

type Props = {
  visible?: boolean;
  className?: string;
};

export function AmbientCanvas({ visible = true, className = "" }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const opacityRef = useRef(visible ? 1 : 0);

  useEffect(() => {
    opacityRef.current = visible ? 1 : 0;
  }, [visible]);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let running = true;

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    function initParticles(w: number, h: number) {
      const types: ParticleType[] = [
        ...Array<ParticleType>(24).fill("bokeh"),
        ...Array<ParticleType>(20).fill("sparkle"),
        ...Array<ParticleType>(16).fill("nebula"),
      ];
      particlesRef.current = types.map((type) => {
        const maxLife = 200 + Math.random() * 300;
        const palette = COLORS[type];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (type === "sparkle" ? 0.35 : 0.12),
          vy: (Math.random() - 0.5) * (type === "sparkle" ? 0.35 : 0.1),
          radius:
            type === "bokeh"
              ? 2 + Math.random() * 6
              : type === "sparkle"
                ? 0.5 + Math.random()
                : 3 + Math.random() * 9,
          opacity:
            type === "bokeh"
              ? 0.15 + Math.random() * 0.2
              : type === "sparkle"
                ? 0.5 + Math.random() * 0.4
                : 0.05 + Math.random() * 0.1,
          color: pick(palette),
          life: Math.random() * maxLife,
          maxLife,
          type,
        };
      });
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particlesRef.current.length === 0) {
        initParticles(window.innerWidth, window.innerHeight);
      }
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    function frame(ts: number) {
      if (!running || document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (ts - last < 16) {
        raf = requestAnimationFrame(frame);
        return;
      }
      last = ts;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalAlpha = opacityRef.current;

      for (const p of particlesRef.current) {
        p.life += 1;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = Math.random() * w;
          p.y = Math.random() * h;
        }

        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const lifeRatio = p.life / p.maxLife;
        const fade =
          lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.9 ? (1 - lifeRatio) / 0.1 : 1;

        if (p.type === "bokeh") ctx!.filter = "blur(2px)";
        else ctx!.filter = "none";

        ctx!.beginPath();
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = opacityRef.current * p.opacity * fade;
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.filter = "none";
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-[1] ${className}`}
      aria-hidden
    />
  );
}
