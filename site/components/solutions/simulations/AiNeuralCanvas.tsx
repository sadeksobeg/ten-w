"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCanvasSize } from "@/components/solutions/simulations/useCanvasSize";
import { SimHudPill, SimHudRow } from "@/components/solutions/simulations/SimHud";

type Node = { x: number; y: number; r: number; phase: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number };

/** Rich neural field: FFT-style input, inference core, softmax output, particles, focus glow */
export function AiNeuralCanvas() {
  const t = useTranslations("SolutionPillarSim.ai");
  const format = useFormatter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef(0);
  const reduced = useReducedMotion();
  const { w, h } = useCanvasSize(wrapRef);
  const [metrics, setMetrics] = useState({ conf: 0.94, tok: 1420, loss: 0.024 });

  useEffect(() => {
    const id = window.setInterval(() => {
      const time = Date.now() / 1000;
      setMetrics({
        conf: 0.88 + 0.1 * (0.5 + 0.5 * Math.sin(time * 0.6)),
        tok: Math.floor(900 + 700 * (0.5 + 0.5 * Math.sin(time * 1.3)) + 200),
        loss: 0.012 + 0.02 * (0.5 + 0.5 * Math.sin(time * 0.45)),
      });
    }, 130);
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

    const cx = w * 0.5;
    const cy = h * 0.5;
    const tNow = performance.now() * 0.001;
    phaseRef.current += reduced ? 0 : 0.06;

    ctx.fillStyle = "#060605";
    ctx.fillRect(0, 0, w, h);

    const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w, h) * 0.7);
    g.addColorStop(0, "rgba(201, 160, 97, 0.1)");
    g.addColorStop(0.5, "rgba(18, 18, 18, 0.35)");
    g.addColorStop(1, "#040403");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Focus glow under cursor
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    if (mx > 0 && my > 0) {
      const fg = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
      fg.addColorStop(0, "rgba(255, 215, 0, 0.07)");
      fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, w, h);
    }

    // --- Left: spectrogram / embedding strip ---
    const inLeft = w * 0.03;
    const inW = w * 0.12;
    const bars = 32;
    const bw = (inW * 0.92) / bars;
    for (let i = 0; i < bars; i++) {
      const amp =
        0.25 +
        0.75 *
          Math.abs(Math.sin(phaseRef.current * 1.2 + i * 0.35 + Math.sin(i * 0.2) * 2));
      const bh = (h * 0.42) * amp * 0.5;
      const bx = inLeft + i * bw + bw * 0.08;
      const by = cy + h * 0.08 - bh;
      const gg = ctx.createLinearGradient(bx, by + bh, bx, by);
      gg.addColorStop(0, "rgba(201, 160, 97, 0.15)");
      gg.addColorStop(0.5, "rgba(255, 215, 0, 0.45)");
      gg.addColorStop(1, "rgba(255, 250, 240, 0.55)");
      ctx.fillStyle = gg;
      ctx.fillRect(bx, by, bw * 0.82, bh);
    }
    ctx.strokeStyle = "rgba(201, 160, 97, 0.2)";
    ctx.strokeRect(inLeft, cy - h * 0.34, inW, h * 0.68);

    // --- Right: output head (softmax-style) ---
    const outLeft = w * 0.88;
    const outW = w * 0.09;
    const obars = 8;
    const obw = outW / obars;
    for (let i = 0; i < obars; i++) {
      const amp = 0.15 + 0.85 * Math.sin(phaseRef.current * 0.9 + i * 0.7) ** 2;
      const bh = h * 0.28 * amp;
      const bx = outLeft + i * obw;
      const by = cy + h * 0.14 - bh;
      ctx.fillStyle = `rgba(201, 160, 97, ${0.25 + 0.5 * amp})`;
      ctx.fillRect(bx + 0.5, by, obw - 1.5, bh);
    }
    ctx.strokeStyle = "rgba(201, 160, 97, 0.2)";
    ctx.strokeRect(outLeft, cy - h * 0.2, outW, h * 0.4);

    // --- Graph nodes (center band) ---
    const nodes: Node[] = [];
    const n = 52;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + i * 0.28;
      const rad = 72 + (i % 9) * 15 + Math.sin(i * 0.65) * 36;
      nodes.push({
        x: cx + Math.cos(ang) * rad * 0.95 + Math.sin(tNow + i) * 5,
        y: cy + Math.sin(ang) * rad * 0.82 + Math.cos(tNow * 0.85 + i) * 5,
        r: 2 + (i % 4) * 0.35,
        phase: i * 0.38,
      });
    }

    const pairs: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      pairs.push([i, (i + 1) % n]);
      pairs.push([i, (i + 8) % n]);
      if (i % 3 === 0) pairs.push([i, Math.floor(n / 2)]);
    }

    ctx.lineCap = "round";
    for (const [a, b] of pairs) {
      const na = nodes[a];
      const nb = nodes[b];
      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      const flow = (tNow * 1.4 + na.phase + nb.phase) % 2;
      ctx.strokeStyle = `rgba(201, 160, 97, ${0.07 + 0.12 * Math.sin(flow * Math.PI)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
      const px = na.x + dx * (0.35 + 0.3 * Math.sin(tNow * 2 + a));
      const py = na.y + dy * (0.35 + 0.3 * Math.sin(tNow * 2 + a));
      ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + 0.25 * Math.sin(tNow * 3 + a)})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Particles toward core
    const parts = particlesRef.current;
    if (!reduced) {
      if (parts.length < 60 && Math.random() < 0.45) {
        parts.push({
          x: inLeft + Math.random() * inW,
          y: cy + (Math.random() - 0.5) * h * 0.5,
          vx: 2 + Math.random() * 2.5,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1,
        });
      }
      for (const p of parts) {
        const dx = cx - p.x;
        const dy = cy - p.y;
        p.vx += dx * 0.0012;
        p.vy += dy * 0.0012;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.006;
      }
      particlesRef.current = parts.filter((p) => p.life > 0 && p.x < w * 0.87);
      for (const p of particlesRef.current) {
        ctx.fillStyle = `rgba(255, 215, 0, ${0.35 * p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Core
    const coreR = 30 + Math.sin(tNow * 1.5) * 5;
    const cg = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreR);
    cg.addColorStop(0, "rgba(255, 215, 0, 0.5)");
    cg.addColorStop(0.45, "rgba(201, 160, 97, 0.22)");
    cg.addColorStop(1, "rgba(201, 160, 97, 0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(201, 160, 97, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 14 + Math.sin(tNow * 2) * 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting ring
    ctx.strokeStyle = "rgba(201, 160, 97, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 58 + Math.sin(tNow * 0.8) * 3, 0, Math.PI * 2);
    ctx.stroke();

    for (const node of nodes) {
      const pulse = 0.55 + 0.45 * Math.sin(tNow * 2 + node.phase);
      ctx.fillStyle = `rgba(201, 160, 97, ${0.32 * pulse})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + pulse * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 250, 240, ${0.45 * pulse})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connector hints: dashed beams in/out
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(201, 160, 97, 0.12)";
    ctx.beginPath();
    ctx.moveTo(inLeft + inW, cy);
    ctx.lineTo(cx - coreR - 4, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + coreR + 4, cy);
    ctx.lineTo(outLeft, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scan lines (subtle)
    ctx.strokeStyle = "rgba(201, 160, 97, 0.04)";
    for (let y = 0; y < h; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y + (tNow * 38) % 26);
      ctx.lineTo(w, y + (tNow * 38) % 26);
      ctx.stroke();
    }
  }, [w, h, reduced]);

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

  return (
    <div
      ref={wrapRef}
      className="relative h-[min(62vh,640px)] w-full min-h-[380px] overflow-hidden rounded-2xl border border-gold/20 bg-[#060605]"
      onMouseMove={(e) => {
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
      onMouseLeave={() => {
        mouseRef.current = { x: -9999, y: -9999 };
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
      <SimHudRow>
        <SimHudPill
          label={t("hud.confidence")}
          value={format.number(metrics.conf, { style: "percent", maximumFractionDigits: 1 })}
          accent="gold"
        />
        <SimHudPill
          label={t("hud.tokensPerSec")}
          value={format.number(metrics.tok, { maximumFractionDigits: 0 })}
          accent="gold"
        />
        <SimHudPill
          label={t("hud.trainLoss")}
          value={format.number(metrics.loss, { maximumFractionDigits: 4 })}
          accent="gold"
        />
      </SimHudRow>
      <div className="pointer-events-none absolute top-11 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-gold/55 sm:top-12 sm:gap-2 sm:text-[9px]">
        <span className="rounded border border-gold/15 bg-black/30 px-1.5 py-0.5">
          {t("hud.layerIn")}
        </span>
        <span className="text-white/25" aria-hidden>
          →
        </span>
        <span className="rounded border border-gold/15 bg-black/30 px-1.5 py-0.5">
          {t("hud.layerHidden")}
        </span>
        <span className="text-white/25" aria-hidden>
          →
        </span>
        <span className="rounded border border-gold/15 bg-black/30 px-1.5 py-0.5">
          {t("hud.layerOut")}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 max-w-[95%] -translate-x-1/2 rounded-md border border-white/5 bg-black/35 px-3 py-1 text-center text-[9px] tracking-wide text-white/40 backdrop-blur-sm">
        {t("hud.caption")}
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.42)_100%)]"
        aria-hidden
      />
    </div>
  );
}
