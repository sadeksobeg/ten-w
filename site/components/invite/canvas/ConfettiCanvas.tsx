"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  width: number;
  height: number;
  color: string;
  type: "rect" | "circle" | "ribbon" | "star" | "square";
};

const COLORS = {
  gold: ["#C9922A", "#E4B84D", "#F5E6C3", "#B07D2B"],
  purple: ["#6B21A8", "#A855F7", "#7C3AED"],
  white: ["#FFFFFF", "#F5F0E8"],
  burgundy: ["#4A1025", "#6B1535", "#3D0E1F"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createPiece(w: number, h: number, type: ConfettiPiece["type"]): ConfettiPiece {
  const maxLife = 180;
  const palette =
    type === "rect" || type === "star"
      ? COLORS.gold
      : type === "circle"
        ? COLORS.purple
        : type === "ribbon"
          ? COLORS.white
          : COLORS.burgundy;

  return {
    x: w * 0.5 + (Math.random() - 0.5) * w * 0.4,
    y: h * 0.65 + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 16,
    vy: -20 - Math.random() * 15,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    life: 0,
    maxLife,
    width: type === "ribbon" ? 2 : type === "star" ? 10 : 4 + Math.random() * 4,
    height: type === "ribbon" ? 20 + Math.random() * 20 : type === "star" ? 10 : 8 + Math.random() * 6,
    color: pick(palette),
    type,
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

type Props = {
  active?: boolean;
  durationMs?: number;
};

export function ConfettiCanvas({ active = true, durationMs = 5000 }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pieces: ConfettiPiece[] = [];
    let raf = 0;
    let running = true;
    const started = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnWave() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const batch: ConfettiPiece["type"][] = [
        ...Array<ConfettiPiece["type"]>(60).fill("rect"),
        ...Array<ConfettiPiece["type"]>(50).fill("circle"),
        ...Array<ConfettiPiece["type"]>(80).fill("ribbon"),
        ...Array<ConfettiPiece["type"]>(40).fill("star"),
        ...Array<ConfettiPiece["type"]>(70).fill("square"),
        ...Array<ConfettiPiece["type"]>(100).fill("circle"),
      ];
      pieces.push(...batch.map((t) => createPiece(w, h, t)));
    }

    function frame() {
      if (!running || document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const elapsed = performance.now() - started;
      if (elapsed > durationMs) {
        running = false;
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const p of pieces) {
        p.life += 1;
        p.vy += 0.3;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const fadeStart = p.maxLife * 0.8;
        const alpha =
          p.life > fadeStart ? Math.max(0, 1 - (p.life - fadeStart) / (p.maxLife - fadeStart)) : 1;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;

        if (p.type === "circle") {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.width, 0, Math.PI * 2);
          ctx!.fill();
        } else if (p.type === "star") {
          drawStar(ctx!, 0, 0, p.width);
        } else if (p.type === "square") {
          ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        } else if (p.type === "ribbon") {
          ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        } else {
          ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx!.restore();
      }

      pieces = pieces.filter((p) => p.life < p.maxLife && p.y < h + 40);
      raf = requestAnimationFrame(frame);
    }

    resize();
    spawnWave();
    setTimeout(spawnWave, 300);
    setTimeout(spawnWave, 600);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, durationMs, reducedMotion]);

  if (!active || reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
    />
  );
}
