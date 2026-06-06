"use client";

import { useRef } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { ConfettiCanvas } from "@/components/invite/canvas/ConfettiCanvas";
import { DownloadInviteButton } from "@/components/invite/DownloadInviteButton";
import { LetterReveal } from "@/components/invite/LetterReveal";
import { useIntersectionReveal } from "@/components/invite/hooks/useIntersectionReveal";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

const PILLARS = [
  {
    title: "الذكاء الاصطناعي",
    desc: "قصص وتجارب تقنية مبنية على أنظمة ذكية قابلة للتوسع.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a7 7 0 017 7c0 2.5-1.2 4.7-3 6.1V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.9A7 7 0 0112 2z" />
        <path d="M9 22h6" />
      </svg>
    ),
  },
  {
    title: "الأمن السيبراني",
    desc: "ثقة وبنية تحمي البيانات والهوية الرقمية بمعايير عالية.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "هندسة البرمجيات",
    desc: "منتجات رقمية متكاملة بجودة عالمية ولمسة عربية أصيلة.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
];

function StarBurst() {
  return (
    <svg className="invite-star-burst mx-auto h-[100px] w-[100px] text-[var(--gold-light)] drop-shadow-[0_0_24px_rgba(201,146,42,0.5)]" viewBox="0 0 100 100" aria-hidden>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="50"
          x2="50"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="8" fill="currentColor" />
    </svg>
  );
}

export function WorldPhase({ card, origin }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const pillarsRef = useRef<HTMLDivElement>(null);
  const pillarsVisible = useIntersectionReveal(pillarsRef);

  return (
    <div className="invite-phase-fade invite-phase-visible fixed inset-0 z-40 overflow-y-auto bg-[var(--void)]">
      {!reducedMotion ? <div className="invite-world-flash pointer-events-none fixed inset-0 z-[60] bg-white" aria-hidden /> : null}
      <ConfettiCanvas active={!reducedMotion} />

      <div className="invite-vignette pointer-events-none fixed inset-0 z-[1]" aria-hidden />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5 py-16 pb-24 text-center sm:px-8 invite-safe-bottom">
        <StarBurst />

        <h2 className="invite-font-display invite-text-shimmer mt-8 text-5xl">
          <LetterReveal text="أهلاً وسهلاً" shimmer staggerMs={80} />
        </h2>

        <p className="invite-name-bounce invite-font-arabic mt-6 text-4xl font-bold text-white">
          {card.name}
        </p>

        <div className="invite-gold-line mx-auto my-8 max-w-[200px]" />

        <p className="max-w-xl text-base leading-relaxed text-[var(--text-sub)] sm:text-lg">
          لقد انضممت رسمياً إلى عالم TENEGTA — حيث تُصنع قصص التقنية بأسلوب لا يُنسى.
        </p>

        <div ref={pillarsRef} className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className={`invite-pillar-card text-center sm:text-start ${pillarsVisible ? "is-visible" : ""}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <span className="text-[var(--gold-light)]">{p.icon}</span>
              <h3 className="mt-3 font-bold text-[var(--text)]">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-sub)]">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="invite-gold-line mx-auto my-12 max-w-md" />

        <DownloadInviteButton
          card={card}
          origin={origin}
          label="احفظ بطاقتك الرقمية"
          large
        />

        <a
          href="https://tenegta.com"
          className="invite-cta-ceremony mt-8 inline-flex items-center justify-center no-underline"
        >
          استكشف TENEGTA ←
        </a>

        <p className="mt-8 text-xs text-white/30">مرجع دعوتك: {card.token}</p>
      </div>
    </div>
  );
}
