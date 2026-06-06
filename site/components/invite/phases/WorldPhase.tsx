"use client";

import { useEffect, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { ConfettiCanvas } from "@/components/invite/canvas/ConfettiCanvas";
import { DownloadInviteButton } from "@/components/invite/DownloadInviteButton";
import { useIntersectionReveal } from "@/components/invite/hooks/useIntersectionReveal";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

const PILLARS = [
  {
    title: "الذكاء الاصطناعي",
    desc: "أنظمة ذكية وقصص تقنية قابلة للتوسع.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a7 7 0 017 7c0 2.5-1.2 4.7-3 6.1V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.9A7 7 0 0112 2z" />
        <path d="M9 22h6" />
      </svg>
    ),
  },
  {
    title: "الأمن السيبراني",
    desc: "ثقة وهوية رقمية بمعايير عالية.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "هندسة البرمجيات",
    desc: "منتجات رقمية بجودة عالمية.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
];

function StarBurst() {
  const rays = Array.from({ length: 12 }, (_, i) => ({
    angle: i * 30,
    length: i % 2 === 0 ? 42 : 22,
  }));

  return (
    <div className="invite-world-burst-wrap">
      <div className="invite-world-burst-ring" aria-hidden />
      <svg className="invite-star-burst" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <filter id="invite-star-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#invite-star-glow)">
          {rays.map(({ angle, length }) => (
            <line
              key={angle}
              x1="50"
              y1="50"
              x2="50"
              y2={50 - length}
              stroke="currentColor"
              strokeWidth="1.5"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function WorldPhase({ card, origin }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const pillarsRef = useRef<HTMLDivElement>(null);
  const pillarsVisible = useIntersectionReveal(pillarsRef, { threshold: 0.15 });
  const [step, setStep] = useState(reducedMotion ? 4 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 900),
      setTimeout(() => setStep(3), 1500),
      setTimeout(() => setStep(4), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return (
    <div className="invite-world-overlay invite-world-letterbox invite-phase-fade invite-phase-visible">
      {!reducedMotion ? <div className="invite-world-flash invite-world-flash-layer" aria-hidden /> : null}
      <ConfettiCanvas active={!reducedMotion} />
      <div className="invite-vignette invite-vignette--world" aria-hidden />

      <div className="invite-world-content invite-safe-bottom">
        <section className="invite-world-hero">
          {step >= 0 ? <StarBurst /> : null}

          {step >= 1 ? (
            <h2 className="invite-world-success-title invite-text-shimmer">تم القبول ✦</h2>
          ) : null}

          {step >= 2 ? (
            <p className="invite-name-bounce invite-world-name">{card.name}</p>
          ) : null}

          {step >= 3 ? (
            <>
              <p className="invite-world-welcome">أهلاً في عالم TENEGTA</p>
              <div className="invite-world-lines" aria-hidden>
                <span />
                <span>✦</span>
                <span />
              </div>
            </>
          ) : null}
        </section>

        {step >= 4 ? (
          <section className="invite-world-body">
            <p className="invite-scene-act">EPILOGUE · العالم</p>
            <p className="invite-world-tagline">
              انضممت رسمياً — حيث تُصنع قصص التقنية بأسلوب لا يُنسى.
            </p>

            <div ref={pillarsRef} className="invite-pillars-grid">
              {PILLARS.map((p, i) => (
                <div
                  key={p.title}
                  className={`invite-pillar-card ${pillarsVisible || reducedMotion ? "is-visible" : ""}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="invite-pillar-icon">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="invite-world-actions">
              <DownloadInviteButton card={card} origin={origin} label="احفظ بطاقتك الرقمية" large />
              <a href="https://tenegta.com" className="invite-cta-ceremony invite-world-cta-link">
                استكشف TENEGTA ←
              </a>
              <p className="invite-world-token">مرجع دعوتك · {card.token}</p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
