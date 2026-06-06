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
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function createPiece(w: number, h: number, type: ConfettiPiece["type"]): ConfettiPiece {
  const maxLife = 160 + Math.random() * 80;
  const palette =
    type === "rect" || type === "square" || type === "star"
      ? COLORS.gold
      : type === "circle"
        ? COLORS.purple
        : COLORS.white;

  return {
    x: Math.random() * w,
    y: h + Math.random() * 20,
    vx: (Math.random() - 0.5) * 12,
    vy: -(8 + Math.random() * 10),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.25,
    life: 0,
    maxLife,
    width:
      type === "ribbon"
        ? 1 + Math.random()
        : type === "star"
          ? 6 + Math.random() * 4
          : type === "square"
            ? 5 + Math.random() * 3
            : 4 + Math.random() * 4,
    height:
      type === "ribbon"
        ? 15 + Math.random() * 20
        : type === "rect"
          ? 8 + Math.random() * 8
          : type === "square"
            ? 5 + Math.random() * 3
            : type === "star"
              ? 6 + Math.random() * 4
              : 3 + Math.random() * 2,
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

function spawnWave(w: number, h: number): ConfettiPiece[] {
  const types: ConfettiPiece["type"][] = [
    ...Array<ConfettiPiece["type"]>(27).fill("rect"),
    ...Array<ConfettiPiece["type"]>(17).fill("circle"),
    ...Array<ConfettiPiece["type"]>(23).fill("ribbon"),
    ...Array<ConfettiPiece["type"]>(20).fill("square"),
    ...Array<ConfettiPiece["type"]>(13).fill("star"),
  ];
  return types.map((t) => createPiece(w, h, t));
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

    function frame() {
      if (!running) return;
      if (document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const elapsed = performance.now() - started;
      if (elapsed > durationMs) {
        running = false;
        ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const p of pieces) {
        p.life += 1;
        p.vy += 0.25;
        p.vx *= 0.998;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const lifeRatio = p.life / p.maxLife;
        const alpha =
          lifeRatio < 0.7
            ? 1
            : Math.max(0, 1 - (lifeRatio - 0.7) / 0.3);

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
          ctx!.save();
          ctx!.rotate(Math.PI / 4);
          ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          ctx!.restore();
        } else if (p.type === "ribbon") {
          ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        } else {
          ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        }
        ctx!.restore();
      }

      pieces = pieces.filter((p) => p.life < p.maxLife && p.y < h + 60);
      raf = requestAnimationFrame(frame);
    }

    resize();
    pieces = spawnWave(window.innerWidth, window.innerHeight);
    setTimeout(() => {
      pieces.push(...spawnWave(window.innerWidth, window.innerHeight));
    }, 250);
    setTimeout(() => {
      pieces.push(...spawnWave(window.innerWidth, window.innerHeight));
    }, 500);
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
      className="invite-canvas-layer invite-canvas-layer--confetti"
      aria-hidden
    />
  );
}
