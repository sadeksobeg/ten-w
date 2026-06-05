"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  alreadyAccepted: boolean;
  onComplete: () => void;
};

const BOOT_LINES = [
  "> initializing secure channel...",
  "> verifying access gateway...",
  "> loading TENEGTA identity matrix...",
  "> decrypting invitation payload...",
  "> ACCESS TOKEN READY",
];

const SHORT_LINES = ["> session restored", "> ACCESS GRANTED"];

export function BootPhase({ alreadyAccepted, onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const lines = alreadyAccepted || reduceMotion ? SHORT_LINES : BOOT_LINES;
  const [visible, setVisible] = useState(reduceMotion ? lines.length : 0);
  const [showLogo, setShowLogo] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) {
      const t = window.setTimeout(onComplete, 400);
      return () => window.clearTimeout(t);
    }

    if (visible < lines.length) {
      const t = window.setTimeout(() => setVisible((v) => v + 1), 420);
      return () => window.clearTimeout(t);
    }

    const logoT = window.setTimeout(() => setShowLogo(true), 300);
    const doneT = window.setTimeout(onComplete, 1400);
    return () => {
      window.clearTimeout(logoT);
      window.clearTimeout(doneT);
    };
  }, [visible, lines.length, onComplete, reduceMotion]);

  return (
    <motion.div
      className="invite-scanline fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="invite-boot-beam" aria-hidden />
      <div className="w-full max-w-lg space-y-2">
        {lines.slice(0, visible).map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`invite-font-mono text-xs sm:text-sm ${
              i === lines.length - 1 ? "text-[var(--invite-teal)]" : "text-white/55"
            }`}
          >
            {line}
            {i === visible - 1 && i === lines.length - 1 ? (
              <span className="invite-cursor-blink" />
            ) : null}
          </motion.p>
        ))}
      </div>

      {showLogo ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          className="invite-glitch mt-12 text-center"
        >
          <p className="invite-font-mono text-[10px] tracking-[0.35em] text-[var(--invite-purple)]">
            SYSTEM ONLINE
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[0.2em] text-white sm:text-4xl">
            T.E.N.E.G.T.A
          </h1>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
