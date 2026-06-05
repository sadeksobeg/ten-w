"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { InviteAmbientCanvas } from "@/components/invite/InviteAmbientCanvas";
import { useInviteWorldCelebration } from "@/components/invite/useInviteWorldCelebration";

type Props = {
  card: InviteCardPublic;
};

const PILLARS = [
  {
    key: "ai",
    titleAr: "ذكاء اصطناعي",
    titleEn: "AI Systems",
    desc: "أنظمة قابلة للتشغيل — من التجريب إلى الإنتاج",
    accent: "#7b6fff",
  },
  {
    key: "cyber",
    titleAr: "أمن سيبراني",
    titleEn: "Cybersecurity",
    desc: "حماية البنية والبيانات بمعايير مؤسسية",
    accent: "#00e5a0",
  },
  {
    key: "software",
    titleAr: "هندسة برمجيات",
    titleEn: "Software Engineering",
    desc: "منتجات متكاملة بجودة عالمية",
    accent: "#e4b84d",
  },
];

export function WorldPhase({ card }: Props) {
  const reduceMotion = useReducedMotion();
  useInviteWorldCelebration(true);

  const columns = useMemo(
    () =>
      Array.from({ length: reduceMotion ? 8 : 22 }, (_, i) => ({
        id: i,
        left: `${(i / 22) * 100}%`,
        delay: `${(i % 7) * 0.7}s`,
        duration: `${6 + (i % 5)}s`,
        chars: "01アイウエオTNGTA".repeat(3),
      })),
    [reduceMotion],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="invite-world-root fixed inset-0 z-40 overflow-hidden bg-[#050508]"
    >
      <InviteAmbientCanvas density={72} />

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0.4], scale: [0.5, 2.8, 3.2] }}
        transition={{ duration: reduceMotion ? 0.2 : 1.4, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-[28%] size-[min(100vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--invite-purple)]/35 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[42%] h-px bg-gradient-to-r from-transparent via-[var(--invite-teal)]/40 to-transparent"
        aria-hidden
      />

      {!reduceMotion
        ? columns.map((col) => (
            <span
              key={col.id}
              className="invite-data-column invite-font-mono pointer-events-none absolute top-0 z-[1] w-px text-[10px] leading-none text-[var(--invite-teal)]/20"
              style={{
                left: col.left,
                animationDuration: col.duration,
                animationDelay: col.delay,
                writingMode: "vertical-rl",
              }}
            >
              {col.chars}
            </span>
          ))
        : null}

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 pb-[max(4rem,env(safe-area-inset-bottom))] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.25, duration: 0.8 }}
          className="invite-world-badge invite-font-mono mb-6 rounded-full border border-[var(--invite-teal)]/35 bg-[var(--invite-teal)]/10 px-5 py-2 text-xs text-[var(--invite-teal)]"
        >
          // TENEGTA WORLD · ACCESS ACTIVE
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0.05 : 0.45, duration: 0.7 }}
          className="invite-world-title text-3xl font-extrabold text-white sm:text-5xl"
        >
          {card.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0.08 : 0.6 }}
          className="invite-font-mono mt-3 text-sm text-[var(--invite-gold)] sm:text-base"
        >
          {card.tier}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0.1 : 0.75 }}
          className="mt-5 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg"
        >
          تم تأكيد دعوتك. أنت الآن داخل عالم TENEGTA — مساحة حيث تُصنع قصص التقنية
          بأسلوب لا يُنسى، وتُبنى شراكات صانعي المحتوى على تميز حقيقي.
        </motion.p>

        <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.85 + i * 0.14, duration: 0.6 }}
              className="invite-pillar-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-start backdrop-blur-md"
              style={{ boxShadow: `0 0 40px -20px ${p.accent}55` }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
                style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }}
                aria-hidden
              />
              <p className="invite-font-mono text-[10px]" style={{ color: p.accent }}>
                {p.titleEn}
              </p>
              <h3 className="mt-2 text-lg font-bold text-white">{p.titleAr}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0.15 : 1.35 }}
          className="invite-font-mono mt-12 text-[10px] text-white/35"
        >
          verified · {card.token} · welcome to the narrative
        </motion.p>
      </div>
    </motion.div>
  );
}
