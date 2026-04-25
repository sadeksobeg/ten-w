"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/GlassCard";
import { playDemoChime, playDemoImpactStinger } from "@/lib/demo/demo-sound";
import { useCinematicDemoStore, type DemoEventDTO, type PlaySpeed } from "@/stores/cinematic-demo-store";

type Props = {
  locale: string;
};

function demoStoryBubbleRole(line: string): "partner" | "admin" | "system" | "impact" {
  const s = line.trimStart();
  if (s.startsWith("Partner:") || s.startsWith("Partenaire") || s.startsWith("الشريك")) return "partner";
  if (s.startsWith("Admin:") || s.startsWith("Admin :") || s.startsWith("الإدارة")) return "admin";
  if (s.startsWith("Impact ·") || s.startsWith("أثر ·")) return "impact";
  return "system";
}

async function postDemoComplete(sessionId: string, status: "COMPLETED" | "ABORTED") {
  try {
    await fetch("/api/growth/admin/demo/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, status }),
    });
  } catch {
    /* non-blocking */
  }
}

export function CinematicDemoExperience({ locale }: Props) {
  const t = useTranslations("Growth.admin.demo");
  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const postedRef = useRef(false);
  const sseRef = useRef<EventSource | null>(null);
  const prevFeedLen = useRef(0);
  const [demoVariant, setDemoVariant] = useState<"alpha" | "beta" | "gamma">("alpha");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const overlayOpen = useCinematicDemoStore((s) => s.overlayOpen);
  const loading = useCinematicDemoStore((s) => s.loading);
  const error = useCinematicDemoStore((s) => s.error);
  const sessionId = useCinematicDemoStore((s) => s.sessionId);
  const events = useCinematicDemoStore((s) => s.events);
  const cursor = useCinematicDemoStore((s) => s.cursor);
  const playing = useCinematicDemoStore((s) => s.playing);
  const reducedMotion = useCinematicDemoStore((s) => s.reducedMotion);
  const speed = useCinematicDemoStore((s) => s.speed);
  const hookTitle = useCinematicDemoStore((s) => s.hookTitle);
  const hookSub = useCinematicDemoStore((s) => s.hookSub);
  const feedLines = useCinematicDemoStore((s) => s.feedLines);
  const storyLines = useCinematicDemoStore((s) => s.storyLines);
  const phaseHeadline = useCinematicDemoStore((s) => s.phaseHeadline);
  const stageIndex = useCinematicDemoStore((s) => s.stageIndex);
  const volumeUsd = useCinematicDemoStore((s) => s.volumeUsd);
  const commissionUsd = useCinematicDemoStore((s) => s.commissionUsd);
  const rank = useCinematicDemoStore((s) => s.rank);
  const networkNodes = useCinematicDemoStore((s) => s.networkNodes);
  const predictionUsd = useCinematicDemoStore((s) => s.predictionUsd);
  const climax = useCinematicDemoStore((s) => s.climax);

  const close = useCinematicDemoStore((s) => s.close);
  const setLoading = useCinematicDemoStore((s) => s.setLoading);
  const setError = useCinematicDemoStore((s) => s.setError);
  const setSpeed = useCinematicDemoStore((s) => s.setSpeed);
  const setReducedMotion = useCinematicDemoStore((s) => s.setReducedMotion);
  const startFromApi = useCinematicDemoStore((s) => s.startFromApi);
  const setPlaying = useCinematicDemoStore((s) => s.setPlaying);
  const applyEventAt = useCinematicDemoStore((s) => s.applyEventAt);
  const bumpCursor = useCinematicDemoStore((s) => s.bumpCursor);
  const replay = useCinematicDemoStore((s) => s.replay);
  const stepNext = useCinematicDemoStore((s) => s.stepNext);
  const applyAllEvents = useCinematicDemoStore((s) => s.applyAllEvents);
  const resetPlayback = useCinematicDemoStore((s) => s.resetPlayback);
  const applyExternalDemoBeat = useCinematicDemoStore((s) => s.applyExternalDemoBeat);
  const clearClimax = useCinematicDemoStore((s) => s.clearClimax);

  const stopSse = useCallback(() => {
    sseRef.current?.close();
    sseRef.current = null;
  }, []);

  const finalize = useCallback(async (natural: boolean) => {
    const sid = useCinematicDemoStore.getState().sessionId;
    if (!sid || postedRef.current) return;
    postedRef.current = true;
    await postDemoComplete(sid, natural ? "COMPLETED" : "ABORTED");
  }, []);

  const exitOverlay = useCallback(() => {
    stopSse();
    const state = useCinematicDemoStore.getState();
    const natural = state.cursor >= state.events.length && state.events.length > 0;
    void finalize(natural);
    close();
  }, [finalize, close, stopSse]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [setReducedMotion]);

  useEffect(() => {
    if (!overlayOpen || !playing || reducedMotion) return;
    if (cursor >= events.length) {
      setPlaying(false);
      if (events.length > 0) void finalize(true);
      return;
    }
    const ev = events[cursor];
    const ms = Math.max(140, ev.delayMs / speed);
    const id = window.setTimeout(() => {
      applyEventAt(cursor);
      bumpCursor();
    }, ms);
    return () => window.clearTimeout(id);
  }, [
    overlayOpen,
    playing,
    reducedMotion,
    cursor,
    events,
    speed,
    applyEventAt,
    bumpCursor,
    setPlaying,
    finalize,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && overlayOpen) exitOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, exitOverlay]);

  useEffect(() => () => stopSse(), [stopSse]);

  useEffect(() => {
    if (!climax) return;
    playDemoImpactStinger(soundEnabled && !reducedMotion);
    const id = window.setTimeout(() => clearClimax(), 4500);
    return () => window.clearTimeout(id);
  }, [climax, soundEnabled, reducedMotion, clearClimax]);

  useEffect(() => {
    if (!overlayOpen) {
      prevFeedLen.current = 0;
      return;
    }
    if (reducedMotion || !soundEnabled) {
      prevFeedLen.current = feedLines.length;
      return;
    }
    if (feedLines.length > prevFeedLen.current && prevFeedLen.current >= 1) {
      playDemoChime(true);
    }
    prevFeedLen.current = feedLines.length;
  }, [feedLines.length, overlayOpen, reducedMotion, soundEnabled]);

  const launch = async () => {
    postedRef.current = false;
    stopSse();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/admin/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, variant: demoVariant }),
      });
      if (!res.ok) {
        setError("start_failed");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as {
        sessionId: string;
        events: DemoEventDTO[];
      };
      startFromApi(data.sessionId, data.events);
      setLoading(false);
    } catch {
      setError("start_failed");
      setLoading(false);
    }
  };

  const onReplay = () => {
    postedRef.current = false;
    stopSse();
    replay();
  };

  const onSseReplay = () => {
    const sid = useCinematicDemoStore.getState().sessionId;
    if (!sid) return;
    stopSse();
    setPlaying(false);
    resetPlayback();
    const u = `/api/growth/admin/demo/stream?sessionId=${encodeURIComponent(sid)}&speed=${encodeURIComponent(String(speed))}`;
    const es = new EventSource(u);
    sseRef.current = es;
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as {
          type?: string;
          kind?: string;
          payload?: Record<string, unknown>;
        };
        if (data.type === "demo_event" && data.kind && data.payload) {
          applyExternalDemoBeat(data.kind, data.payload);
          if (soundEnabled && !reducedMotion) playDemoChime(true);
        }
      } catch {
        /* ignore */
      }
    };
  };

  const onStep = () => {
    const len = useCinematicDemoStore.getState().events.length;
    const before = useCinematicDemoStore.getState().cursor;
    stepNext();
    const after = useCinematicDemoStore.getState().cursor;
    if (before < len && after >= len && len > 0) {
      void finalize(true);
    }
  };

  const onRevealAll = () => {
    applyAllEvents();
    void finalize(true);
  };

  const speedBtn = (v: PlaySpeed) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      speed === v
        ? "border border-gold/50 bg-gold/15 text-gold"
        : "border border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20"
    }`;

  const stepBtn =
    "rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/85 hover:border-gold/35";

  const stages = [
    t("dealStage0"),
    t("dealStage1"),
    t("dealStage2"),
    t("dealStage3"),
    t("dealStage4"),
  ];

  const maxDots = 10;
  const lit = Math.min(networkNodes, maxDots);

  const crisisHook =
    !!hookTitle &&
    (/critical|critique|حرج|لحظة حرجة/i.test(hookTitle) ||
      hookTitle.toLowerCase().includes("moment critique"));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-3xl font-extrabold">
          {t("pageTitle")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">{t("pageLead")}</p>
      </div>

      <GlassCard className="border border-white/12 bg-white/[0.03] p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
              {t("variantLabel")}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["alpha", "beta", "gamma"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDemoVariant(v)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    demoVariant === v
                      ? "border border-gold/45 bg-gold/15 text-gold"
                      : "border border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20"
                  }`}
                >
                  {v === "alpha" ? t("variantAlpha") : v === "beta" ? t("variantBeta") : t("variantGamma")}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 hover:border-gold/30"
          >
            {soundEnabled ? t("soundOn") : t("soundOff")}
          </button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-gold/80">{t("hookLine")}</div>
            <p className="mt-1 text-sm text-white/60">
              {reducedMotion ? t("reducedTitle") : t("speed")}
            </p>
          </div>
          <button
            type="button"
            onClick={launch}
            disabled={loading}
            className="rounded-full border border-gold/40 bg-gradient-to-r from-gold/25 to-amber-500/20 px-6 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(201,160,97,0.25)] transition hover:border-gold/60 disabled:opacity-50"
          >
            {loading ? t("loading") : t("launch")}
          </button>
        </div>
        {error ? (
          <p className="mt-4 text-sm text-rose-300" role="alert">
            {t("startError")}
          </p>
        ) : null}
      </GlassCard>

      <AnimatePresence>
        {overlayOpen ? (
          <motion.div
            key="demo-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={t("pageTitle")}
            dir={dir}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#030712]/95 p-4 pt-20 backdrop-blur-md sm:pt-24"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative flex h-[min(92vh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_0_80px_rgba(99,102,241,0.12)]"
            >
              <AnimatePresence>
                {climax ? (
                  <motion.div
                    key="demo-climax"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/[0.93] px-6 text-center backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ scale: 0.94, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 220, damping: 22 }}
                      className="max-w-lg"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.42em] text-gold/75">
                        T.E.N.E.G.T.A
                      </p>
                      <h2 className="mt-5 font-[family-name:var(--font-cairo)] text-3xl font-black leading-tight text-white sm:text-4xl">
                        {climax.title}
                      </h2>
                      {climax.sub ? (
                        <p className="mt-4 text-sm leading-relaxed text-white/60">{climax.sub}</p>
                      ) : null}
                      {climax.ownership ? (
                        <p className="mt-5 border-t border-white/10 pt-4 text-sm font-semibold leading-relaxed text-amber-100/95">
                          {climax.ownership}
                        </p>
                      ) : null}
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t("chapter")}
                  {phaseHeadline ? (
                    <span className="ms-2 text-white/80">{phaseHeadline}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold text-white/40">{t("speed")}</span>
                  {([1, 2, 5] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={speedBtn(v)}
                      onClick={() => setSpeed(v)}
                    >
                      {v}x
                    </button>
                  ))}
                  {reducedMotion ? (
                    <>
                      <button type="button" className={stepBtn} onClick={onStep}>
                        {t("nextBeat")}
                      </button>
                      <button type="button" className={stepBtn} onClick={onRevealAll}>
                        {t("revealAll")}
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={onSseReplay}
                    className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-100 hover:bg-violet-500/20"
                  >
                    {t("sseReplayGo")}
                  </button>
                  <button
                    type="button"
                    onClick={onReplay}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                  >
                    {t("replay")}
                  </button>
                  <button
                    type="button"
                    onClick={exitOverlay}
                    className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/20"
                  >
                    {t("close")}
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <AnimatePresence mode="wait">
                    {hookTitle ? (
                      <motion.div
                        key={hookTitle}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`rounded-2xl border p-6 ${
                          crisisHook
                            ? "border-rose-500/45 bg-gradient-to-br from-rose-600/20 via-black/40 to-transparent shadow-[0_0_40px_rgba(244,63,94,0.15)]"
                            : "border-gold/25 bg-gradient-to-br from-gold/10 to-transparent"
                        }`}
                      >
                        <div className="text-2xl font-extrabold text-white">{hookTitle}</div>
                        {hookSub ? (
                          <p className="mt-2 text-sm text-white/65">{hookSub}</p>
                        ) : null}
                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/55">
                        {t("loading")}
                      </div>
                    )}
                  </AnimatePresence>

                  <GlassCard className="border border-violet-400/15 bg-violet-500/[0.04] p-4">
                    <div className="text-xs font-semibold text-white/45">{t("storyChat")}</div>
                    <div className="mt-3 max-h-[220px] space-y-2 overflow-y-auto text-sm">
                      {storyLines.length === 0 ? (
                        <p className="text-sm text-white/40">{t("storyChatEmpty")}</p>
                      ) : (
                        storyLines.map((line, i) => {
                          const role = demoStoryBubbleRole(line);
                          const align =
                            role === "partner"
                              ? dir === "rtl"
                                ? "items-end text-right"
                                : "items-start text-left"
                              : role === "admin"
                                ? dir === "rtl"
                                  ? "items-start text-left"
                                  : "items-end text-right"
                                : "items-center text-center";
                          const bubble =
                            role === "partner"
                              ? "border-white/10 bg-white/[0.06] text-white/90"
                              : role === "admin"
                                ? "border-gold/30 bg-gold/10 text-white"
                                : role === "impact"
                                  ? "border-violet-400/35 bg-violet-600/15 text-xs text-violet-50 shadow-[0_0_18px_rgba(139,92,246,0.2)]"
                                  : "border-emerald-400/20 bg-emerald-500/10 text-xs text-emerald-50/95";
                          return (
                            <motion.div
                              key={`${i}-${line.slice(0, 40)}`}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex flex-col ${align}`}
                            >
                              <div className={`max-w-[92%] rounded-2xl border px-3 py-2 ${bubble}`}>
                                {line}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </GlassCard>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/45">{t("dealJourney")}</div>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((label, i) => {
                        const active = stageIndex >= i;
                        const current = stageIndex === i;
                        return (
                          <div
                            key={label}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                              current
                                ? "border border-gold/50 bg-gold/15 text-gold"
                                : active
                                  ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                                  : "border border-white/10 bg-white/[0.03] text-white/45"
                            }`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/45">{t("networkMap")}</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: maxDots }).map((_, i) => (
                        <div key={i} className="flex items-center">
                          <motion.div
                            className={`h-3 w-3 rounded-full ${
                              i < lit ? "bg-gold shadow-[0_0_12px_rgba(201,160,97,0.6)]" : "bg-white/15"
                            }`}
                            animate={{ scale: i < lit ? [1, 1.15, 1] : 1 }}
                            transition={{ duration: 0.45 }}
                          />
                          {i < maxDots - 1 ? (
                            <div
                              className={`mx-0.5 h-px w-4 ${
                                i < lit - 1 ? "bg-gold/50" : "bg-white/10"
                              }`}
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {reducedMotion ? (
                    <p className="text-xs leading-relaxed text-white/50">{t("reducedBody")}</p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <GlassCard className="border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs font-semibold text-white/45">{t("metrics")}</div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-[10px] uppercase text-white/40">{t("volume")}</dt>
                        <dd className="font-bold text-white">
                          {new Intl.NumberFormat(nfLocale, {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(volumeUsd)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase text-white/40">{t("commission")}</dt>
                        <dd className="font-bold text-emerald-200">
                          {new Intl.NumberFormat(nfLocale, {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(commissionUsd)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase text-white/40">{t("rank")}</dt>
                        <dd className="font-bold text-white">{rank != null ? `#${rank}` : "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase text-white/40">{t("network")}</dt>
                        <dd className="font-bold text-white">{networkNodes}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[10px] uppercase text-white/40">{t("prediction")}</dt>
                        <dd className="font-bold text-violet-200">
                          {predictionUsd != null
                            ? new Intl.NumberFormat(nfLocale, {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              }).format(predictionUsd)
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </GlassCard>

                  <GlassCard className="flex max-h-[320px] flex-col border border-white/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold text-white/45">{t("liveFeed")}</div>
                    <ul className="mt-3 flex-1 space-y-2 overflow-y-auto text-sm">
                      {feedLines.length === 0 ? (
                        <li className="text-white/35">…</li>
                      ) : (
                        feedLines
                          .slice()
                          .reverse()
                          .map((line, idx) => (
                            <motion.li
                              key={`${feedLines.length}-${idx}-${line.slice(0, 24)}`}
                              initial={{ opacity: 0, x: dir === "rtl" ? -8 : 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-white/85"
                            >
                              {line}
                            </motion.li>
                          ))
                      )}
                    </ul>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
