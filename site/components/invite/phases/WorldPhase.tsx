"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { InviteAmbientCanvas } from "@/components/invite/InviteAmbientCanvas";
import { useInviteWorldCelebration } from "@/components/invite/useInviteWorldCelebration";

type Props = {
  card: InviteCardPublic;
};

const PILLARS = [
  {
    title: "ذكاء اصطناعي",
    desc: "قصص وتجارب تقنية مبنية على أنظمة ذكية قابلة للتوسع.",
    accent: "#9d8cff",
  },
  {
    title: "أمن سيبراني",
    desc: "ثقة وبنية تحمي البيانات والهوية الرقمية بمعايير عالية.",
    accent: "#3ee8b8",
  },
  {
    title: "هندسة برمجيات",
    desc: "منتجات رقمية متكاملة بجودة عالمية ولمسة عربية أصيلة.",
    accent: "#e8c872",
  },
];

export function WorldPhase({ card }: Props) {
  const reduceMotion = useReducedMotion();
  useInviteWorldCelebration(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-[#03040a]"
    >
      <InviteAmbientCanvas density={48} />
      <div className="invite-aurora fixed inset-0 opacity-60" aria-hidden />
      <div className="invite-vignette pointer-events-none fixed inset-0 z-[1]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 0.35], scale: [0.6, 2.2, 2.8] }}
        transition={{ duration: reduceMotion ? 0.15 : 1.6, ease: "easeOut" }}
        className="pointer-events-none fixed left-1/2 top-[22%] size-[min(100vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--invite-gold)]/20 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5 py-16 pb-[max(5rem,env(safe-area-inset-bottom))] text-center sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.7 }}
          className="invite-badge mb-6"
        >
          ✦ تم تأكيد دعوتك
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0.05 : 0.35, duration: 0.8 }}
          className="invite-world-hero text-white"
        >
          أهلاً بك، {card.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0.08 : 0.55 }}
          className="mt-4 text-base font-semibold text-[var(--invite-gold-bright)] sm:text-lg"
        >
          {card.tier} · {card.scope}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0.1 : 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-[1.9] text-white/70 sm:text-lg"
        >
          أنت الآن داخل عالم TENEGTA — حيث تُصنع قصص التقنية بأسلوب لا يُنسى، وتُبنى
          شراكات صانعي المحتوى على تميّز حقيقي. فريقنا متحمس للقاءك واستكشاف
          إمكانيات التعاون معاً.
        </motion.p>

        <div className="invite-gold-line mx-auto my-12 w-full max-w-md opacity-70" aria-hidden />

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.85 + i * 0.12, duration: 0.65 }}
              className="invite-benefit-card text-center sm:text-start"
              style={{ boxShadow: `0 0 50px -24px ${p.accent}66` }}
            >
              <div
                className="mx-auto mb-3 h-px w-12 sm:mx-0"
                style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }}
                aria-hidden
              />
              <h3 className="text-lg font-bold text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0.12 : 1.2, duration: 0.7 }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <a
            href="https://tenegta.com"
            className="invite-cta-primary min-w-[240px]"
          >
            زيارة موقع TENEGTA ←
          </a>
          <p className="max-w-md text-xs leading-relaxed text-white/35">
            مرجع دعوتك: {card.token}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
