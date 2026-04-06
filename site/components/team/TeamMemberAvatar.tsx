"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  portraitAlt: string;
  /** Optional public path, e.g. `/images/team/caricature.png` — add your caricature file to `public/images/team/` */
  portraitSrc?: string;
  /** Optional override via env (same as portraitSrc) */
  envPortraitUrl?: string | null;
};

function AnimatedLeadPortrait() {
  const reduce = useReducedMotion();

  return (
    <div
      className="team-avatar-shell relative isolate h-32 w-full overflow-hidden rounded-lg"
      aria-hidden
    >
      <div className="team-avatar-aurora pointer-events-none absolute inset-0 opacity-90" />
      <div className="team-avatar-grid pointer-events-none absolute inset-0 opacity-30" />
      <motion.div
        className="pointer-events-none absolute -left-1/4 top-0 h-[140%] w-1/2 bg-gradient-to-r from-transparent via-gold/25 to-transparent blur-xl"
        animate={
          reduce
            ? { x: "0%" }
            : { x: ["-20%", "120%", "-20%"] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg
        className="relative z-[1] h-full w-full"
        viewBox="0 0 320 160"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="team-avatar-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(212 175 55 / 0.95)" />
            <stop offset="50%" stopColor="rgb(245 230 180 / 0.55)" />
            <stop offset="100%" stopColor="rgb(180 140 50 / 0.85)" />
          </linearGradient>
          <radialGradient id="team-avatar-glow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgb(212 175 55 / 0.35)" />
            <stop offset="55%" stopColor="rgb(30 30 35 / 0.2)" />
            <stop offset="100%" stopColor="rgb(10 10 12 / 0)" />
          </radialGradient>
          <filter id="team-avatar-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="160" cy="120" rx="100" ry="28" fill="url(#team-avatar-glow)" />
        <motion.g
          filter="url(#team-avatar-soft)"
          animate={reduce ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M160 28c18 0 32 14 32 32 0 8-3 15-8 20 10 6 17 18 17 32v8H119v-8c0-14 7-26 17-32-5-5-8-12-8-20 0-18 14-32 32-32z"
            fill="rgb(18 18 22 / 0.92)"
            stroke="url(#team-avatar-gold)"
            strokeWidth="1.25"
          />
          <path
            d="M118 118c12-8 28-12 42-12s30 4 42 12"
            stroke="url(#team-avatar-gold)"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.85"
          />
        </motion.g>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            cx={60 + i * 48}
            cy={38 + (i % 3) * 8}
            r="2.2"
            fill="rgb(212 175 55 / 0.9)"
            animate={
              reduce
                ? {}
                : {
                    opacity: [0.3, 1, 0.3],
                    scale: [0.85, 1.15, 0.85],
                  }
            }
            transition={{
              duration: 2.4 + i * 0.35,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
        <motion.path
          d="M40 90 Q160 72 280 90"
          stroke="url(#team-avatar-gold)"
          strokeWidth="0.6"
          strokeOpacity="0.45"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 2.8, ease: "easeOut" }}
        />
        <path
          d="M52 104 L268 104"
          stroke="rgb(212 175 55 / 0.35)"
          strokeWidth="0.5"
          strokeDasharray="4 6"
          className={reduce ? "" : "team-avatar-dash"}
        />
      </svg>
      <div className="team-avatar-scan pointer-events-none absolute inset-0 z-[2]" />
    </div>
  );
}

export function TeamMemberAvatar({
  portraitAlt,
  portraitSrc,
  envPortraitUrl,
}: Props) {
  const src = envPortraitUrl?.trim() || portraitSrc;
  const reduce = useReducedMotion();

  if (src) {
    const isRemote =
      src.startsWith("http://") || src.startsWith("https://");

    return (
      <motion.div
        className="relative h-32 w-full overflow-hidden rounded-lg"
        initial={false}
        animate={reduce ? {} : { scale: [1, 1.01, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] ring-1 ring-gold/40"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] bg-gradient-to-t from-black/50 via-transparent to-gold/10" />
        {isRemote ? (
          // eslint-disable-next-line @next/next/no-img-element -- env may point to external caricature CDN
          <img
            src={src}
            alt={portraitAlt}
            className="absolute inset-0 z-0 h-full w-full object-cover object-top"
          />
        ) : (
          <Image
            src={src}
            alt={portraitAlt}
            fill
            sizes="(max-width: 768px) 100vw, 32rem"
            className="object-cover object-top"
            priority
          />
        )}
      </motion.div>
    );
  }

  return (
    <div role="img" aria-label={portraitAlt}>
      <AnimatedLeadPortrait />
    </div>
  );
}
