"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import {
  analyzeDescription,
  type SystemType,
  type VisualizationConfig,
} from "@/lib/system-visualizer";
import {
  drawSystemScene,
  setupCanvas,
} from "@/lib/system-visualizer-scenes";

const EXAMPLE_CHIPS = [
  "نظام ذكاء اصطناعي يتنبأ بأعطال الآلات في المصنع",
  "منصة حماية من الهجمات الإلكترونية لشبكة مؤسسية",
  "Multi-tenant SaaS platform for project management",
  "Real-time payment processing with fraud detection",
  "نظام تتبع أسطول شاحنات مع تحسيل المسارات",
  "IoT sensor network for smart building management",
] as const;

const CANVAS_HEIGHT = 560;

type Locale = "ar" | "en" | "fr";

type Props = {
  locale: Locale;
};

export function SystemVisualizer({ locale }: Props) {
  const t = useTranslations("HomePage.SystemVisualizer");
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = useState(800);
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<VisualizationConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setWidth(Math.max(320, Math.floor(r.width)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleAnalyze = useCallback(() => {
    const trimmed = description.trim();
    if (!trimmed) return;
    setIsAnalyzing(true);
    setHasResult(false);
    setConfig(null);
    window.setTimeout(() => {
      setConfig(analyzeDescription(trimmed));
      setHasResult(true);
      setIsAnalyzing(false);
    }, 320);
  }, [description]);

  const drawFrame = useCallback(
    (staticOnly: boolean) => {
      const canvas = canvasRef.current;
      const cfg = config;
      if (!canvas || !cfg) return;
      const ctx = setupCanvas(canvas, width, CANVAS_HEIGHT);
      if (!ctx) return;

      drawSystemScene({
        ctx,
        w: width,
        h: CANVAS_HEIGHT,
        config: cfg,
        time: staticOnly ? 0 : timeRef.current,
        locale,
        reduced: staticOnly || reduced,
      });
    },
    [config, width, locale, reduced],
  );

  useEffect(() => {
    if (!config) return;

    if (reduced) {
      drawFrame(true);
      return;
    }

    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      timeRef.current = now * 0.001;
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
    if (config) drawFrame(reduced);
  }, [config, width, reduced, drawFrame]);

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
        className="relative h-[min(56vh,560px)] w-full max-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#050807]"
        style={{ height: CANVAS_HEIGHT }}
      >
        {!config && !isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
            {t("empty")}
          </div>
        )}
        {isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            <span>{t("analyzing")}</span>
            <span className="ms-1 inline-flex gap-0.5" aria-hidden>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce [animation-delay:0.15s]">.</span>
              <span className="animate-bounce [animation-delay:0.3s]">.</span>
            </span>
          </div>
        )}
        {config && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block h-full w-full"
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
