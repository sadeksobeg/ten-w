"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCanvasSize } from "@/components/solutions/simulations/useCanvasSize";
import { SimHudPill, SimHudRow } from "@/components/solutions/simulations/SimHud";

type Bit = { x: number; y: number; vx: number; lane: number; trail: { x: number; y: number }[] };

/** Regional backbone — spine nodes, heat lanes, packet trails, cross-region HUD */
export function InfraTrafficCanvas() {
  const t = useTranslations("SolutionPillarSim.infra");
  const format = useFormatter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { w, h } = useCanvasSize(wrapRef);
  const bitsRef = useRef<Bit[]>([]);
  const [agg, setAgg] = useState({ rps: 11800, slo: 99.35, cross: 46 });

  useEffect(() => {
    const id = window.setInterval(() => {
      const time = Date.now() / 1000;
      setAgg({
        rps: Math.floor(9000 + 5000 * (0.5 + 0.5 * Math.sin(time * 0.55))),
        slo: 98.5 + 1.2 * (0.5 + 0.5 * Math.sin(time * 0.35)),
        cross: Math.floor(32 + 28 * (0.5 + 0.5 * Math.sin(time * 0.62))),
      });
    }, 170);
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

    ctx.fillStyle = "#070608";
    ctx.fillRect(0, 0, w, h);

    // Ambient
    const ag = ctx.createRadialGradient(w * 0.5, h * 0.35, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
    ag.addColorStop(0, "rgba(201, 160, 97, 0.06)");
    ag.addColorStop(1, "transparent");
    ctx.fillStyle = ag;
    ctx.fillRect(0, 0, w, h);

    const lanes = 5;
    const laneH = (h * 0.52) / lanes;
    const top = h * 0.2;
    const regions = ["EU", "MENA", "APAC", "US", "LOCAL"];
    const spineX = w * 0.5;

    // Horizontal lanes + load
    for (let L = 0; L < lanes; L++) {
      const y = top + L * laneH;
      const load = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(tt * 0.65 + L * 1.05));
      const barW = w * 0.58 * load;
      const bx = w * 0.2;
      const latMs = Math.floor(8 + 48 * (1 - load * 0.4) + L * 3);

      const gg = ctx.createLinearGradient(bx, y, bx + barW, y);
      gg.addColorStop(0, "rgba(201, 160, 97, 0.12)");
      gg.addColorStop(0.45, "rgba(201, 160, 97, 0.5)");
      gg.addColorStop(1, "rgba(255, 215, 0, 0.38)");
      ctx.fillStyle = gg;
      ctx.fillRect(bx, y + laneH * 0.26, barW, laneH * 0.48);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
      ctx.strokeRect(bx, y + laneH * 0.2, w * 0.62, laneH * 0.6);

      ctx.fillStyle = "rgba(226, 232, 240, 0.75)";
      ctx.font = "600 10px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(regions[L] ?? "—", w * 0.04, y + laneH * 0.55);

      ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
      ctx.font = "500 9px ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${latMs} ms`, w * 0.96, y + laneH * 0.52);
    }

    // Backbone spine + glowing nodes
    ctx.strokeStyle = "rgba(201, 160, 97, 0.35)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(spineX, top * 0.55);
    ctx.lineTo(spineX, h * 0.9);
    ctx.stroke();
    for (let L = 0; L < lanes; L++) {
      const y = top + L * laneH + laneH * 0.5;
      const pulse = 0.4 + 0.6 * Math.sin(tt * 2 + L);
      const ng = ctx.createRadialGradient(spineX, y, 0, spineX, y, 14);
      ng.addColorStop(0, `rgba(255, 215, 0, ${0.25 * pulse})`);
      ng.addColorStop(1, "transparent");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(spineX, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(201, 160, 97, ${0.5 + 0.2 * pulse})`;
      ctx.beginPath();
      ctx.arc(spineX, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cross-connector arcs (region peering)
    ctx.strokeStyle = "rgba(201, 160, 97, 0.08)";
    ctx.lineWidth = 1;
    for (let L = 0; L < lanes - 1; L++) {
      const y1 = top + L * laneH + laneH * 0.5;
      const y2 = top + (L + 1) * laneH + laneH * 0.5;
      ctx.beginPath();
      ctx.moveTo(spineX + 5, y1);
      ctx.quadraticCurveTo(spineX + 42, (y1 + y2) / 2, spineX + 5, y2);
      ctx.stroke();
    }

    if (bitsRef.current.length < 70 && Math.random() < 0.28) {
      bitsRef.current.push({
        x: w * 0.1,
        y: 0,
        vx: 1.4 + Math.random() * 3.2,
        lane: Math.floor(Math.random() * lanes),
        trail: [],
      });
    }

    bitsRef.current = bitsRef.current.filter((b) => b.x < w * 0.97);

    for (const b of bitsRef.current) {
      b.x += b.vx;
      const yy = top + b.lane * laneH + laneH * 0.46;
      if (!reduced) {
        b.trail.push({ x: b.x, y: yy });
        if (b.trail.length > 8) b.trail.shift();
      }
      for (let i = 0; i < b.trail.length; i++) {
        const tr = b.trail[i];
        const a = (i + 1) / b.trail.length;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.12 * a})`;
        ctx.fillRect(tr.x - 2, tr.y, 4 + b.vx * 0.8, 2);
      }
      ctx.fillStyle = "rgba(255, 235, 180, 0.95)";
      ctx.fillRect(b.x, yy, 6 + (b.vx > 2.5 ? 4 : 0), 2.5);
    }

    ctx.fillStyle = "rgba(201, 160, 97, 0.5)";
    ctx.font = "600 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("BACKBONE", spineX, top * 0.38);
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

  useEffect(() => {
    bitsRef.current = [];
  }, [w, h]);

  return (
    <div
      ref={wrapRef}
      className="relative h-[min(62vh,640px)] w-full min-h-[380px] overflow-hidden rounded-2xl border border-amber-500/20 bg-[#070608]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
      <SimHudRow>
        <SimHudPill
          label={t("hud.throughput")}
          value={`${format.number(agg.rps, { maximumFractionDigits: 0 })} RPS`}
          accent="amber"
        />
        <SimHudPill
          label={t("hud.slo")}
          value={format.number(agg.slo / 100, { style: "percent", maximumFractionDigits: 2 })}
          accent="amber"
        />
        <SimHudPill
          label={t("hud.crossLatency")}
          value={`${agg.cross} ms`}
          accent="amber"
        />
        <SimHudPill label={t("hud.backbone")} value="OK" accent="amber" />
      </SimHudRow>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_35%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />
    </div>
  );
}
