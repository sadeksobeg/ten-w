"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCanvasSize } from "@/components/solutions/simulations/useCanvasSize";
import { SimHudPill, SimHudRow } from "@/components/solutions/simulations/SimHud";

type Mod = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  hue: number;
  kind: "gateway" | "service";
};

function quadPoint(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  mx: number,
  my: number,
  u: number,
) {
  const px = (1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u ** 2 * bx;
  const py = (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u ** 2 * by;
  return { x: px, y: py };
}

/** Service mesh — central gateway, dual req/resp tokens, health LEDs */
export function SoftwareMeshCanvas() {
  const t = useTranslations("SolutionPillarSim.software");
  const format = useFormatter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { w, h } = useCanvasSize(wrapRef);
  const modsRef = useRef<Mod[]>([]);
  const [metrics, setMetrics] = useState({ p99: 38, rps: 2840, healthy: 8, queue: 2 });

  useEffect(() => {
    const id = window.setInterval(() => {
      const time = Date.now() / 1000;
      setMetrics({
        p99: Math.floor(28 + 22 * (0.5 + 0.5 * Math.sin(time * 0.9))),
        rps: Math.floor(2100 + 900 * (0.5 + 0.5 * Math.sin(time * 1.1))),
        healthy: 7 + (Math.sin(time * 0.4) > 0 ? 1 : 0),
        queue: Math.max(0, Math.floor(1 + 3 * Math.sin(time * 0.7) ** 2)),
      });
    }, 160);
    return () => clearInterval(id);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tt = performance.now() * 0.001;
    const cx = w * 0.5;
    const cy = h * 0.52;

    ctx.fillStyle = "#08090c";
    ctx.fillRect(0, 0, w, h);

    const g = ctx.createRadialGradient(cx, cy, 24, cx, cy, Math.max(w, h) * 0.58);
    g.addColorStop(0, "rgba(99, 102, 241, 0.09)");
    g.addColorStop(0.55, "rgba(30, 27, 75, 0.12)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = "rgba(129, 140, 248, 0.04)";
    for (let gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }

    if (modsRef.current.length === 0) {
      const ring: Mod[] = [];
      const labels = ["API", "SVC", "JOB", "UI", "DATA", "EDGE", "BFF", "EVT"];
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const rad = Math.min(w, h) * 0.3;
        ring.push({
          x: cx + Math.cos(ang) * rad - 38,
          y: cy + Math.sin(ang) * rad - 20,
          w: 76,
          h: 40,
          label: labels[i] ?? "M",
          hue: 215 + i * 14,
          kind: "service",
        });
      }
      modsRef.current = [
        {
          x: cx - 52,
          y: cy - 28,
          w: 104,
          h: 56,
          label: "GW",
          hue: 265,
          kind: "gateway",
        },
        ...ring,
      ];
    }
    const mods = modsRef.current;
    const gw = mods[0];

    // Edges: gateway to each satellite + some mesh links
    ctx.lineWidth = 1.15;
    for (let i = 1; i < mods.length; i++) {
      const a = gw;
      const b = mods[i];
      const ax = a.x + a.w / 2;
      const ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2;
      const by = b.y + b.h / 2;
      const mx = (ax + bx) / 2 + Math.sin(tt + i) * 22;
      const my = (ay + by) / 2 + Math.cos(tt * 0.9 + i) * 18;

      ctx.strokeStyle = `rgba(129, 140, 248, ${0.18 + 0.1 * Math.sin(tt + i)})`;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(mx, my, bx, by);
      ctx.stroke();

      // Request token (gold)
      const u1 = (tt * 0.28 + i * 0.07) % 1;
      const p1 = quadPoint(ax, ay, bx, by, mx, my, u1);
      ctx.fillStyle = "rgba(201, 160, 97, 0.95)";
      ctx.shadowColor = "rgba(201, 160, 97, 0.5)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Response token (cyan), opposite direction
      if (!reduced) {
        const u2 = (1 - ((tt * 0.22 + i * 0.11) % 1));
        const p2 = quadPoint(ax, ay, bx, by, mx, my, u2);
        ctx.fillStyle = "rgba(34, 211, 238, 0.9)";
        ctx.shadowColor = "rgba(34, 211, 238, 0.45)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Cross-links between satellites (sparse)
    for (let i = 1; i < mods.length; i++) {
      for (let j = i + 2; j < mods.length; j += 3) {
        const a = mods[i];
        const b = mods[j];
        const ax = a.x + a.w / 2;
        const ay = a.y + a.h / 2;
        const bx = b.x + b.w / 2;
        const by = b.y + b.h / 2;
        ctx.strokeStyle = `rgba(129, 140, 248, ${0.06 + 0.04 * Math.sin(tt + i + j)})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    for (const m of mods) {
      const float = Math.sin(tt * 1.15 + m.hue * 0.008) * (m.kind === "gateway" ? 2 : 2.5);
      ctx.fillStyle = `hsla(${m.hue}, ${m.kind === "gateway" ? 42 : 32}%, ${m.kind === "gateway" ? 22 : 16}%, 0.96)`;
      ctx.strokeStyle = `hsla(${m.hue}, 55%, 58%, ${m.kind === "gateway" ? 0.65 : 0.45})`;
      ctx.lineWidth = m.kind === "gateway" ? 2 : 1.4;
      const x = m.x;
      const y = m.y + float;
      const r = m.kind === "gateway" ? 14 : 9;
      ctx.beginPath();
      const rr = (
        ctx as CanvasRenderingContext2D & {
          roundRect?: (x: number, y: number, w: number, h: number, r: number) => void;
        }
      ).roundRect;
      if (typeof rr === "function") {
        rr.call(ctx, x, y, m.w, m.h, r);
      } else {
        ctx.rect(x, y, m.w, m.h);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(226, 232, 240, 0.92)";
      ctx.font = `${m.kind === "gateway" ? 700 : 600} ${m.kind === "gateway" ? 13 : 11}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(m.label, x + m.w / 2, y + m.h / 2 + 4);

      // Health LED
      const pulse = 0.5 + 0.5 * Math.sin(tt * 3 + m.hue * 0.02);
      ctx.fillStyle = `rgba(34, 197, 94, ${0.35 + 0.45 * pulse})`;
      ctx.beginPath();
      ctx.arc(x + m.w - 8, y + 10, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [w, h, reduced]);

  useEffect(() => {
    modsRef.current = [];
  }, [w, h]);

  useEffect(() => {
    if (reduced) {
      draw();
      return;
    }
    let id = 0;
    const loop = () => {
      draw();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [draw, reduced]);

  useEffect(() => {
    draw();
  }, [draw, w, h]);

  return (
    <div
      ref={wrapRef}
      className="relative h-[min(62vh,640px)] w-full min-h-[380px] overflow-hidden rounded-2xl border border-indigo-500/25 bg-[#08090c]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
      <SimHudRow>
        <SimHudPill
          label={t("hud.p99")}
          value={`${format.number(metrics.p99, { maximumFractionDigits: 0 })} ms`}
          accent="indigo"
        />
        <SimHudPill
          label={t("hud.rps")}
          value={format.number(metrics.rps, { maximumFractionDigits: 0 })}
          accent="indigo"
        />
        <SimHudPill
          label={t("hud.healthy")}
          value={`${metrics.healthy}/9`}
          accent="indigo"
        />
        <SimHudPill
          label={t("hud.queue")}
          value={String(metrics.queue)}
          accent="indigo"
        />
      </SimHudRow>
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-md border border-indigo-500/15 bg-black/45 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.22em] text-indigo-200/45 backdrop-blur-sm">
        {t("hud.mesh")}
      </div>
    </div>
  );
}
