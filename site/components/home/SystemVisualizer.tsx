"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useCanvasSize } from "@/components/solutions/simulations/useCanvasSize";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import {
  analyzeDescription,
  type SystemType,
  type VisualizationConfig,
} from "@/lib/system-visualizer";

const EXAMPLE_CHIPS = [
  "نظام ذكاء اصطناعي يتنبأ بأعطال الآلات في المصنع",
  "منصة حماية من الهجمات الإلكترونية لشبكة مؤسسية",
  "Multi-tenant SaaS platform for project management",
  "Real-time payment processing with fraud detection",
  "نظام تتبع أسطول شاحنات مع تحسين المسارات",
  "IoT sensor network for smart building management",
] as const;

type Locale = "ar" | "en" | "fr";

type Props = {
  locale: Locale;
};

type NodeLayout = {
  id: string;
  x: number;
  y: number;
  label: string;
};

type FlowLayout = {
  from: string;
  to: string;
  bidirectional?: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type Particle = {
  flowIndex: number;
  t: number;
  speed: number;
  offset: number;
};

const NODE_RADIUS = 44;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function computeLayouts(
  config: VisualizationConfig,
  w: number,
  h: number,
  locale: Locale,
): { nodes: NodeLayout[]; flows: FlowLayout[] } {
  const count = config.nodes.length;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.32;

  const nodes: NodeLayout[] = config.nodes.map((n, i) => {
    let x: number;
    let y: number;
    if (count <= 5) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      x = cx + R * Math.cos(angle);
      y = cy + R * Math.sin(angle);
    } else if (count === 6) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      x = cx + R * Math.cos(angle);
      y = cy + R * Math.sin(angle);
    } else {
      if (i === 0) {
        x = cx;
        y = cy;
      } else {
        const angle = ((i - 1) / 6) * Math.PI * 2 - Math.PI / 2;
        x = cx + R * Math.cos(angle);
        y = cy + R * Math.sin(angle);
      }
    }
    const label =
      locale === "ar" ? n.label.ar : n.label.en;
    return { id: n.id, x, y, label };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const flows: FlowLayout[] = [];
  for (const f of config.flows) {
    const a = nodeMap.get(f.from);
    const b = nodeMap.get(f.to);
    if (!a || !b) continue;
    flows.push({
      from: f.from,
      to: f.to,
      bidirectional: f.bidirectional,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
    });
  }

  return { nodes, flows };
}

function wrapLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  atEnd: boolean,
  atStart: boolean,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const inset = NODE_RADIUS + 4;

  if (atEnd) {
    const ex = x2 - ux * inset;
    const ey = y2 - uy * inset;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * 8 - uy * 4, ey - uy * 8 + ux * 4);
    ctx.lineTo(ex - ux * 8 + uy * 4, ey - uy * 8 - ux * 4);
    ctx.closePath();
    ctx.fill();
  }
  if (atStart) {
    const sx = x1 + ux * inset;
    const sy = y1 + uy * inset;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + ux * 8 - uy * 4, sy + uy * 8 + ux * 4);
    ctx.lineTo(sx + ux * 8 + uy * 4, sy + uy * 8 - ux * 4);
    ctx.closePath();
    ctx.fill();
  }
}

function initParticles(flowCount: number): Particle[] {
  const particles: Particle[] = [];
  for (let fi = 0; fi < flowCount; fi++) {
    for (let p = 0; p < 4; p++) {
      particles.push({
        flowIndex: fi,
        t: p * 0.25,
        speed: 0.15 + p * 0.03,
        offset: p * 0.1,
      });
    }
  }
  return particles;
}

export function SystemVisualizer({ locale }: Props) {
  const t = useTranslations("HomePage.SystemVisualizer");
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { w, h } = useCanvasSize(wrapRef);

  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<VisualizationConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  const handleAnalyze = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) return;
    setIsAnalyzing(true);
    setHasResult(false);
    setConfig(null);
    window.setTimeout(() => {
      const result = analyzeDescription(trimmed);
      setConfig(result);
      setHasResult(true);
      setIsAnalyzing(false);
    }, 320);
  }, [description]);

  const drawFrame = useCallback(
    (staticOnly: boolean) => {
      const canvas = canvasRef.current;
      const cfg = config;
      if (!canvas || !cfg) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { nodes, flows } = computeLayouts(cfg, w, h, locale);
      const time = staticOnly ? 0 : timeRef.current;
      const { primary, secondary, accent } = cfg.palette;
      const style = cfg.animationStyle;

      ctx.fillStyle = "#050807";
      ctx.fillRect(0, 0, w, h);

      const centerNode = nodes[0];

      if (style === "radar" && centerNode && !staticOnly) {
        const sweep = (time * 0.6) % (Math.PI * 2);
        for (let ring = 1; ring <= 4; ring++) {
          ctx.strokeStyle = hexToRgba(primary, 0.06);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerNode.x, centerNode.y, ring * 40, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = hexToRgba(accent, 0.35);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerNode.x, centerNode.y);
        ctx.lineTo(
          centerNode.x + Math.cos(sweep) * 180,
          centerNode.y + Math.sin(sweep) * 180,
        );
        ctx.stroke();
        for (const node of nodes) {
          const angle = Math.atan2(
            node.y - centerNode.y,
            node.x - centerNode.x,
          );
          const diff = Math.abs(
            ((angle - sweep + Math.PI) % (Math.PI * 2)) - Math.PI,
          );
          if (diff < 0.25) {
            ctx.fillStyle = hexToRgba(accent, 0.2);
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_RADIUS + 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      for (let fi = 0; fi < flows.length; fi++) {
        const f = flows[fi];
        const lineColor = hexToRgba(secondary, 0.25);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(f.x1, f.y1);
        ctx.lineTo(f.x2, f.y2);
        ctx.stroke();

        if (style === "wave" && !staticOnly) {
          const dx = f.x2 - f.x1;
          const dy = f.y2 - f.y1;
          const len = Math.hypot(dx, dy) || 1;
          const steps = Math.max(8, Math.floor(len / 12));
          ctx.strokeStyle = hexToRgba(secondary, 0.5);
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const p = s / steps;
            const px = f.x1 + dx * p;
            const py = f.y1 + dy * p;
            const wave =
              Math.sin(p * Math.PI * 4 + time * 3) * 8;
            const nx = -dy / len;
            const ny = dx / len;
            const wx = px + nx * wave;
            const wy = py + ny * wave;
            if (s === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        if (
          (style === "particles" ||
            style === "radar" ||
            style === "orbit") &&
          !staticOnly
        ) {
          const particles = particlesRef.current.filter(
            (p) => p.flowIndex === fi,
          );
          for (const p of particles) {
            const tPos = (p.t + time * p.speed) % 1;
            const px = f.x1 + (f.x2 - f.x1) * tPos;
            const py = f.y1 + (f.y2 - f.y1) * tPos;
            ctx.fillStyle = hexToRgba(primary, 0.5 + 0.5 * (1 - tPos));
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        drawArrow(
          ctx,
          f.x1,
          f.y1,
          f.x2,
          f.y2,
          hexToRgba(secondary, 0.5),
          true,
          Boolean(f.bidirectional),
        );
      }

      const connectionCount = new Map<string, number>();
      for (const f of flows) {
        connectionCount.set(f.from, (connectionCount.get(f.from) ?? 0) + 1);
        connectionCount.set(f.to, (connectionCount.get(f.to) ?? 0) + 1);
      }

      nodes.forEach((node, idx) => {
        const isHovered = hoveredId === node.id;
        const fillAlpha = isHovered ? 0.2 : 0.1;
        const strokeAlpha = isHovered ? 0.7 : 0.4;

        if (style === "pulse" && !staticOnly) {
          const phase = (time * 1.2 + idx * 0.4) % 1;
          const rippleR = NODE_RADIUS + phase * 28;
          ctx.strokeStyle = hexToRgba(primary, 0.25 * (1 - phase));
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, rippleR, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (style === "orbit" && !staticOnly) {
          const satellites = connectionCount.get(node.id) ?? 1;
          for (let s = 0; s < satellites; s++) {
            const angle =
              (time * 0.8 + s * ((Math.PI * 2) / satellites)) %
              (Math.PI * 2);
            const ox = node.x + Math.cos(angle) * (NODE_RADIUS + 14);
            const oy = node.y + Math.sin(angle) * (NODE_RADIUS + 14);
            ctx.fillStyle = hexToRgba(accent, 0.7);
            ctx.beginPath();
            ctx.arc(ox, oy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.fillStyle = hexToRgba(primary, fillAlpha);
        ctx.strokeStyle = hexToRgba(primary, strokeAlpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = primary;
        ctx.font = "500 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = wrapLabel(ctx, node.label, NODE_RADIUS * 1.6);
        const lineHeight = 13;
        const startY = node.y - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, li) => {
          ctx.fillText(line, node.x, startY + li * lineHeight);
        });
      });
    },
    [config, w, h, locale, hoveredId],
  );

  useEffect(() => {
    if (!config) return;
    particlesRef.current = initParticles(config.flows.length);

    if (reduced) {
      drawFrame(true);
      return;
    }

    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      timeRef.current = now * 0.001;
      for (const p of particlesRef.current) {
        p.t = (p.t + p.speed * 0.008) % 1;
      }
      drawFrame(false);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [config, reduced, drawFrame]);

  useEffect(() => {
    if (config && reduced) drawFrame(true);
  }, [config, reduced, w, h, drawFrame]);

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!config) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { nodes } = computeLayouts(config, w, h, locale);
    let found: string | null = null;
    for (const n of nodes) {
      if (Math.hypot(mx - n.x, my - n.y) <= NODE_RADIUS) {
        found = n.id;
        break;
      }
    }
    setHoveredId(found);
  };

  const badgeKey = config?.type ?? "software";

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="space-y-8">
      <header className="max-w-3xl">
        <h2 className="font-[family-name:var(--font-cairo)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">
          {t("subtitle")}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setDescription(chip)}
            className="rounded-full border border-white/15 bg-surface/40 px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-gold/40 hover:text-foreground sm:text-sm"
          >
            {chip.length > 48 ? `${chip.slice(0, 48)}…` : chip}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("placeholder")}
          rows={4}
          className="min-h-[80px] w-full resize-y rounded-xl border border-white/15 bg-surface/30 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
        <Button
          type="button"
          onClick={handleAnalyze}
          disabled={!description.trim() || isAnalyzing}
          className="w-full sm:w-auto"
        >
          {t("btnAnalyze")}
        </Button>
      </div>

      <div
        ref={wrapRef}
        className="relative min-h-[380px] w-full overflow-hidden rounded-2xl border border-white/10 bg-surface/50"
      >
        {!config && !isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
            {t("empty")}
          </div>
        )}
        {isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            <span>{t("analyzing")}</span>
            <span className="ml-1 inline-flex gap-0.5" aria-hidden>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.15s]">.</span>
              <span className="animate-bounce [animation-delay:0.3s]">.</span>
            </span>
          </div>
        )}
        {config && (
          <canvas
            ref={canvasRef}
            className="block h-full min-h-[380px] w-full"
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredId(null)}
            aria-label={config.title[locale]}
          />
        )}
      </div>

      {hasResult && config && (
        <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: config.palette.primary }}
            >
              {t(`badges.${badgeKey as SystemType}`)}
            </span>
            <h3 className="font-[family-name:var(--font-cairo)] text-xl font-bold text-foreground">
              {config.title[locale]}
            </h3>
            <p className="text-sm text-muted">
              {t(`summaries.${badgeKey as SystemType}`)}
            </p>
          </div>
          <Link
            href={`/contact?system=${encodeURIComponent(description)}&type=${encodeURIComponent(config.type)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            {t("btnBuild")}
            <span aria-hidden>{locale === "ar" ? " ←" : " →"}</span>
          </Link>
        </footer>
      )}
    </div>
  );
}
