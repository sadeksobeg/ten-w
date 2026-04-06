"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useCanvasSize } from "@/components/solutions/simulations/useCanvasSize";
import { SimHudEventStrip, SimHudPill, SimHudRow } from "@/components/solutions/simulations/SimHud";

type Blip = {
  a: number;
  r: number;
  state: "threat" | "clear";
  born: number;
  severity: "high" | "low";
  trail: { x: number; y: number; a: number }[];
};

/** SOC radar — dual sweep, severity blips, trails, compass, event strip */
export function CyberRadarCanvas() {
  const t = useTranslations("SolutionPillarSim.cyber");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { w, h } = useCanvasSize(wrapRef);
  const blipsRef = useRef<Blip[]>([]);
  const lastSpawnRef = useRef(0);
  const prevSweepRef = useRef(0);
  const [stats, setStats] = useState({ active: 5, cleared: 142, rpm: 41 });
  const [logOff, setLogOff] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStats((s) => ({
        active: Math.max(2, Math.min(12, s.active + (Math.random() > 0.55 ? 1 : -1))),
        cleared: s.cleared + (Math.random() > 0.65 ? 1 : 0),
        rpm: 36 + Math.floor(Math.random() * 10),
      }));
    }, 450);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setLogOff((o) => o + 1), 2300);
    return () => clearInterval(id);
  }, []);

  const logKeys = ["log1", "log2", "log3", "log4", "log5", "log6"] as const;
  const eventLines = [0, 1, 2, 3].map((i) => t(`hud.${logKeys[(logOff + i) % 6]}`));

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

    const time = performance.now() * 0.001;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const R = Math.min(w, h) * 0.38;
    const sweep = (time * 0.85) % (Math.PI * 2);
    const ghostSweep = prevSweepRef.current;
    prevSweepRef.current = sweep;

    ctx.fillStyle = "#050807";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";
    ctx.lineWidth = 1;
    const step = 26;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Range rings + distance labels
    ctx.strokeStyle = "rgba(34, 197, 94, 0.12)";
    ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
    ctx.font = "500 9px system-ui";
    ctx.textAlign = "center";
    for (let i = 1; i <= 4; i++) {
      const rr = (R * i) / 4;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText(`${i * 25}km`, cx + rr - 18, cy - 4);
    }

    // Ghost sweep
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ghostSweep);
    const ghost = ctx.createLinearGradient(0, 0, R, 0);
    ghost.addColorStop(0, "rgba(34, 197, 94, 0.08)");
    ghost.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = ghost;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, -0.35, 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Primary sweep
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweep);
    const grd = ctx.createLinearGradient(0, 0, R, 0);
    grd.addColorStop(0, "rgba(34, 197, 94, 0.38)");
    grd.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, -0.42, 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    const sg = ctx.createRadialGradient(cx, cy, 8, cx, cy, 48);
    sg.addColorStop(0, "rgba(59, 130, 246, 0.28)");
    sg.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fill();

    blipsRef.current = blipsRef.current.filter((b) => time - b.born < 8);

    if (time - lastSpawnRef.current > 0.42 && blipsRef.current.length < 14) {
      lastSpawnRef.current = time;
      blipsRef.current.push({
        a: Math.random() * Math.PI * 2,
        r: 44 + Math.random() * (R - 52),
        state: "threat",
        born: time,
        severity: Math.random() > 0.72 ? "high" : "low",
        trail: [],
      });
    }

    for (const b of blipsRef.current) {
      let diff = b.a - sweep;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) < 0.24 && b.state === "threat") b.state = "clear";

      const x = cx + Math.cos(b.a) * b.r;
      const y = cy + Math.sin(b.a) * b.r;
      if (!reduced && b.trail.length < 12) {
        b.trail.push({ x, y, a: b.a });
      }

      for (let i = 0; i < b.trail.length; i++) {
        const tr = b.trail[i];
        const age = i / b.trail.length;
        ctx.fillStyle = `rgba(34, 197, 94, ${0.08 * age})`;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 2 + age * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      const isHigh = b.severity === "high" && b.state === "threat";
      ctx.fillStyle =
        b.state === "threat"
          ? isHigh
            ? "rgba(248, 113, 113, 0.95)"
            : "rgba(239, 68, 68, 0.92)"
          : "rgba(34, 197, 94, 0.95)";
      ctx.shadowColor =
        b.state === "threat"
          ? isHigh
            ? "rgba(248, 113, 113, 0.85)"
            : "rgba(239, 68, 68, 0.75)"
          : "rgba(34, 197, 94, 0.55)";
      ctx.shadowBlur = isHigh ? 18 : 12;
      const rad = b.state === "threat" ? (isHigh ? 7 : 5) : 4;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (b.state === "threat" && isHigh) {
        ctx.strokeStyle = "rgba(248, 113, 113, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, rad + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = "rgba(201, 160, 97, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cx - 12, cy - 12, 24, 24);

    // Compass rose ticks
    ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * Math.PI * 2;
      const r0 = R + 6;
      const r1 = R + (k % 4 === 0 ? 14 : 8);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
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

  useEffect(() => {
    draw();
  }, [draw, w, h]);

  return (
    <div
      ref={wrapRef}
      className="relative h-[min(62vh,640px)] w-full min-h-[380px] overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#050807]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
      <SimHudRow>
        <SimHudPill label={t("hud.activeThreats")} value={String(stats.active)} accent="emerald" />
        <SimHudPill label={t("hud.neutralized")} value={String(stats.cleared)} accent="emerald" />
        <SimHudPill label={t("hud.sweepRpm")} value={`${stats.rpm} RPM`} accent="emerald" />
      </SimHudRow>
      <div className="pointer-events-none absolute top-11 left-1/2 z-10 -translate-x-1/2 text-[9px] font-medium uppercase tracking-[0.28em] text-emerald-400/50 sm:top-12">
        {t("hud.compass")}
      </div>
      <div
        className="pointer-events-none absolute inset-0 text-[10px] font-semibold text-emerald-500/35"
        aria-hidden
      >
        <span className="absolute left-1/2 top-[10%] -translate-x-1/2">N</span>
        <span className="absolute bottom-[10%] left-1/2 -translate-x-1/2">S</span>
        <span className="absolute top-1/2 right-[8%] -translate-y-1/2">E</span>
        <span className="absolute top-1/2 left-[8%] -translate-y-1/2">W</span>
      </div>
      <SimHudEventStrip lines={eventLines} />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08)_0%,transparent_55%)]"
        aria-hidden
      />
    </div>
  );
}
