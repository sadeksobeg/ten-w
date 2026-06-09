"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = { locale: string };

const FRAMES = ["ai", "cyber", "software", "services", "ascend"] as const;
type Frame = (typeof FRAMES)[number];

const FRAME_LABELS: Record<Frame, { ar: string; en: string; fr: string }> = {
  ai: { ar: "ذكاء اصطناعي", en: "AI Systems", fr: "IA" },
  cyber: { ar: "أمن سيبراني", en: "Cyber Defense", fr: "Cybersécurité" },
  software: { ar: "منصات برمجية", en: "Software Stack", fr: "Logiciels" },
  services: { ar: "خدمات الشركة", en: "Enterprise Services", fr: "Services" },
  ascend: { ar: "منصة ASCEND", en: "ASCEND Platform", fr: "ASCEND" },
};

function FrameContent({ frame }: { frame: Frame }) {
  if (frame === "ai") {
    return (
      <div className="flex h-full flex-col justify-between bg-[#050208] p-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.32em] text-violet-300/90">ENTERPRISE AI</p>
          <p className="mt-3 font-[family-name:var(--font-cairo)] text-xl font-black text-white">نماذج ذكاء للمؤسسات</p>
          <p className="mt-2 text-xs text-white/45">RAG · Agents · MLOps</p>
        </div>
        <div className="space-y-2.5">
          {[
            { label: "Inference", w: 88 },
            { label: "Accuracy", w: 72 },
            { label: "Latency", w: 94 },
          ].map((row, i) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-[9px] text-white/40">
                <span>{row.label}</span>
                <span>{row.w}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="fc-service-bar h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-300"
                  style={{ width: `${row.w}%`, animationDelay: `${i * 0.2}s` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (frame === "cyber") {
    return (
      <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#040a12] to-[#0a1428] p-6">
        <div className="fc-cyber-scan absolute inset-0 opacity-40" aria-hidden />
        <div className="relative">
          <p className="font-mono text-[10px] tracking-[0.28em] text-emerald-300/90">ZERO TRUST SOC</p>
          <p className="mt-3 font-[family-name:var(--font-cairo)] text-lg font-black text-white">حماية متعددة الطبقات</p>
        </div>
        <div className="relative grid grid-cols-3 gap-2">
          {["SOC", "SIEM", "EDR"].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="fc-cyber-node rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2 py-4 text-center"
            >
              <p className="text-[9px] font-bold text-emerald-100">{label}</p>
              <p className="mt-1 text-[8px] text-emerald-300/70">LIVE</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  if (frame === "software") {
    return (
      <div className="grid h-full grid-cols-2 gap-2.5 bg-[#0c0818] p-5">
        {[
          { label: "منصات", value: "12+", sub: "Production" },
          { label: "تطبيقات", value: "48", sub: "Deployed" },
          { label: "تكامل", value: "API", sub: "Open" },
          { label: "توفر", value: "99.9%", sub: "SLA" },
        ].map((cell, i) => (
          <div
            key={cell.label}
            className="fc-service-card flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <p className="text-[10px] text-white/45">{cell.label}</p>
            <p className="font-[family-name:var(--font-cairo)] text-xl font-black text-[var(--creator-secondary)]">{cell.value}</p>
            <p className="text-[8px] uppercase tracking-wider text-white/30">{cell.sub}</p>
          </div>
        ))}
      </div>
    );
  }
  if (frame === "services") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#080510] p-6 text-center">
        <div className="fc-services-beams absolute inset-0" aria-hidden />
        <div className="fc-service-orbit relative size-28 rounded-full border border-amber-500/40 shadow-[0_0_40px_rgba(201,146,42,0.25)]">
          <span className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-500/25 via-rose-500/10 to-violet-500/15" />
          <span className="fc-orbit-dot absolute start-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_12px_#fbbf24]" />
        </div>
        <p className="relative mt-5 font-[family-name:var(--font-cairo)] text-lg font-black text-white">خدمات الشركة</p>
        <p className="relative mt-1 text-[11px] tracking-[0.2em] text-white/45">T.E.N.E.G.T.A ENTERPRISE</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-end bg-gradient-to-t from-[#0a0612] to-[#150a20] p-5">
      <div className="mb-3 flex items-end gap-1.5">
        {[35, 58, 42, 72, 48, 88, 64].map((h, i) => (
          <div
            key={i}
            className="fc-service-bar flex-1 rounded-t-md bg-gradient-to-t from-rose-600/70 via-rose-500/40 to-amber-400/50"
            style={{ height: `${h}%`, maxHeight: "5rem", animationDelay: `${i * 0.07}s` }}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono tracking-widest text-white/50">ASCEND · CREATOR HUB</p>
      <p className="mt-1 text-xs text-white/35">شريك · عمولات · ترتيب حي</p>
    </div>
  );
}

export function ForCreatorsDemoMockup({ locale }: Props) {
  const t = useTranslations("Creators.public.demo");
  const [frame, setFrame] = useState<Frame>("ai");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setFrame((f) => FRAMES[(FRAMES.indexOf(f) + 1) % FRAMES.length]!);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused]);

  const label = FRAME_LABELS[frame][locale as "ar" | "en" | "fr"] ?? FRAME_LABELS[frame].en;

  return (
    <section id="demo" className="relative mx-auto max-w-5xl overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(124,58,237,0.12),transparent_70%)]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative text-center"
      >
        <p className="font-mono text-[11px] tracking-[0.35em] text-[var(--creator-secondary)]/70">{t("eyebrow")}</p>
        <h2 className="mt-4 font-[family-name:var(--font-cairo)] text-[clamp(1.75rem,5vw,2.75rem)] font-black leading-tight text-white">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">{t("subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="fc-demo-stage relative mx-auto mt-12 max-w-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="fc-demo-browser fc-demo-browser--premium overflow-hidden rounded-2xl border border-white/12 bg-[#0a0614]">
          <div className="flex items-center gap-2 border-b border-white/10 bg-black/50 px-4 py-3">
            <span className="size-2.5 rounded-full bg-rose-500/90 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="size-2.5 rounded-full bg-amber-400/90" />
            <span className="size-2.5 rounded-full bg-emerald-500/90" />
            <span className="ms-2 flex-1 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-1.5 text-start font-mono text-[10px] text-white/40">
              tenegta.com/solutions/intelligent-systems
            </span>
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-200 sm:inline">
              LIVE
            </span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={frame}
                initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <FrameContent frame={frame} />
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
            <p className="absolute bottom-3 start-4 font-[family-name:var(--font-cairo)] text-sm font-bold text-white/90">{label}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {FRAMES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrame(f)}
              className={`fc-demo-pill rounded-full px-3 py-1.5 text-[10px] font-bold transition ${frame === f ? "fc-demo-pill--active" : "text-white/45 hover:text-white/70"}`}
            >
              {FRAME_LABELS[f][locale as "ar" | "en" | "fr"] ?? FRAME_LABELS[f].en}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 text-center text-sm text-white/55"
      >
        {t("below")}
      </motion.p>
      <div className="mt-5 flex justify-center">
        <Link href={`/${locale}/solutions/intelligent-systems`}>
          <GoldButton type="button" className="fc-cta-glow !px-8 !py-3">
            {t("cta")}
          </GoldButton>
        </Link>
      </div>
    </section>
  );
}
