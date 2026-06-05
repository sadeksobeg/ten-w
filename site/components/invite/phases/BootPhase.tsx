"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  alreadyAccepted: boolean;
  onComplete: () => void;
};

export function BootPhase({ alreadyAccepted, onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(reduceMotion ? 3 : 0);

  useEffect(() => {
    if (reduceMotion) {
      const t = window.setTimeout(onComplete, 500);
      return () => window.clearTimeout(t);
    }

    const timers = [
      window.setTimeout(() => setStage(1), 600),
      window.setTimeout(() => setStage(2), 1600),
      window.setTimeout(() => setStage(3), 2600),
      window.setTimeout(onComplete, alreadyAccepted ? 3200 : 3800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [alreadyAccepted, onComplete, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#03040a] px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="invite-aurora opacity-80" aria-hidden />

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="invite-gold-line mb-10 w-full max-w-xs origin-center"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 20 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="invite-eyebrow mb-4">T.E.N.E.G.T.A</p>
        <h1 className="invite-boot-logo invite-boot-glow">TENEGTA</h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 12 }}
        transition={{ duration: 0.8, delay: 0.05 }}
        className="mt-8 max-w-md text-center text-lg font-semibold text-white/75 sm:text-xl"
      >
        {alreadyAccepted ? "مرحباً بعودتك" : "لديك دعوة خاصة"}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 3 ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        className="mt-3 text-sm text-white/45"
      >
        {alreadyAccepted
          ? "جاري فتح تجربتك…"
          : "دعوة حصرية لصانع محتوى — مُعدّة بعناية لك وحدك"}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 2 ? 0.6 : 0 }}
        className="invite-scroll-hint absolute bottom-10 flex flex-col items-center gap-2 text-white/40"
        aria-hidden
      >
        <span className="text-[10px] tracking-[0.2em]">SCROLL</span>
        <span className="text-lg">↓</span>
      </motion.div>
    </motion.div>
  );
}
