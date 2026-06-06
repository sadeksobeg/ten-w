"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Particle = {
  x: number;
  y: number;
  vy: number;
  vx: number;
  vxPhase: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
};

const COLORS = ["#C9922A", "#E4B84D", "#F5E6C3", "#A855F7"];
const COUNT = 50;

function spawnParticle(w: number, h: number): Particle {
  const maxLife = 120 + Math.random() * 80;
  return {
    x: Math.random() * w,
    y: h + Math.random() * 20,
    vy: -(0.2 + Math.random() * 0.6),
    vx: (Math.random() - 0.5) * 0.3,
    vxPhase: Math.random() * Math.PI * 2,
    radius: 0.5 + Math.random() * 1.5,
    opacity: 0,
    life: 0,
    maxLife,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#C9922A",
  };
}

type Props = {
  visible?: boolean;
};

export function UpwardParticlesCanvas({ visible = true }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function resetParticle(p: Particle, w: number, h: number) {
      Object.assign(p, spawnParticle(w, h));
    }

    function frame() {
      if (!running) return;
      if (document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      if (particles.length < COUNT) {
        particles.push(spawnParticle(w, h));
      }

      for (const p of particles) {
        p.life += 1;
        p.vxPhase += 0.02;
        p.x += p.vx + Math.sin(p.vxPhase) * 0.15;
        p.y += p.vy;

        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.2) {
          p.opacity = lifeRatio / 0.2;
        } else if (lifeRatio > 0.7) {
          p.opacity = Math.max(0, 1 - (lifeRatio - 0.7) / 0.3);
        } else {
          p.opacity = 1;
        }

        if (p.life >= p.maxLife || p.y < -10) {
          resetParticle(p, w, h);
        }

        ctx!.beginPath();
        ctx!.globalAlpha = p.opacity * 0.6;
        ctx!.fillStyle = p.color;
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize();
    particles = Array.from({ length: COUNT }, () => spawnParticle(window.innerWidth, window.innerHeight));
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [visible, reducedMotion]);

  if (!visible || reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1] opacity-60"
      aria-hidden
    />
  );
}
