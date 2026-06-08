"use client";

import { useEffect, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { AccessTokenCard } from "@/components/invite/AccessTokenCard";
import { ConfettiCanvas } from "@/components/invite/canvas/ConfettiCanvas";
import { DownloadInviteButton } from "@/components/invite/DownloadInviteButton";
import { WorldSystemsOrbit } from "@/components/invite/WorldSystemsOrbit";
import { useIntersectionReveal } from "@/components/invite/hooks/useIntersectionReveal";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";
import { isCreatorProgramInvite } from "@/lib/growth/creator-program";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

const PILLARS = [
  {
    id: "ai",
    title: "الذكاء الاصطناعي",
    desc: "أنظمة ذكية، نماذج مخصّصة، وقصص تقنية قابلة للتوسع.",
    delay: 0,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a7 7 0 017 7c0 2.5-1.2 4.7-3 6.1V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.9A7 7 0 0112 2z" />
        <path d="M9 22h6" />
      </svg>
    ),
  },
  {
    id: "cyber",
    title: "الأمن السيبراني",
    desc: "حماية الهوية الرقمية وبنية ثقة على مستوى المؤسسات.",
    delay: 120,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "dev",
    title: "هندسة البرمجيات",
    desc: "منتجات رقمية متكاملة بجودة عالمية ولمسة عربية.",
    delay: 240,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
];

function StarBurst() {
  const rays = Array.from({ length: 12 }, (_, i) => ({
    angle: i * 30,
    length: i % 2 === 0 ? 44 : 24,
  }));

  return (
    <div className="invite-world-burst-wrap">
      <div className="invite-world-burst-ring" aria-hidden />
      <div className="invite-world-burst-ring invite-world-burst-ring--2" aria-hidden />
      <svg className="invite-star-burst" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <filter id="invite-star-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
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
  const pillarsVisible = useIntersectionReveal(pillarsRef, { threshold: 0.1 });
  const [step, setStep] = useState(reducedMotion ? 7 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    const schedule: Array<[number, number]> = [
      [350, 1],
      [800, 2],
      [1250, 3],
      [1750, 4],
      [2400, 5],
      [3100, 6],
      [3800, 7],
    ];
    const timers = schedule.map(([ms, s]) => setTimeout(() => setStep(s), ms));
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return (
    <div className="invite-world-overlay invite-world-letterbox invite-phase-fade invite-phase-visible">
      {!reducedMotion ? <div className="invite-world-flash invite-world-flash-layer" aria-hidden /> : null}
      <ConfettiCanvas active={!reducedMotion} durationMs={6000} />
      <div className="invite-vignette invite-vignette--world" aria-hidden />
      {step >= 4 ? <WorldSystemsOrbit active /> : null}

      <div className="invite-world-content invite-safe-bottom">
        <section className={`invite-world-hero ${step >= 4 ? "invite-world-hero--compact" : ""}`}>
          {step >= 0 ? <StarBurst /> : null}

          {step >= 1 ? (
            <h2 className="invite-world-success-title invite-text-shimmer invite-world-step-in">
              تم القبول ✦
            </h2>
          ) : null}

          {step >= 2 ? (
            <p className="invite-name-bounce invite-world-name invite-world-step-in">{card.name}</p>
          ) : null}

          {step >= 3 ? (
            <div className="invite-world-step-in">
              <p className="invite-world-welcome">أهلاً في عالم TENEGTA</p>
              <div className="invite-world-lines" aria-hidden>
                <span />
                <span>✦</span>
                <span />
              </div>
            </div>
          ) : null}
        </section>

        {step >= 4 ? (
          <section className="invite-world-card-stage invite-world-step-in">
            <p className="invite-world-card-label">بطاقة وصولك الرسمية</p>
            <div className="invite-world-card-halo-wrap">
              <div className="invite-world-card-halo invite-world-card-halo--1" aria-hidden />
              <div className="invite-world-card-halo invite-world-card-halo--2" aria-hidden />
              <AccessTokenCard card={card} variant="luxury" revealed />
            </div>
          </section>
        ) : null}

        {step >= 5 ? (
          <section className="invite-world-body invite-world-step-in">
            <p className="invite-scene-act">EPILOGUE · عالم الأنظمة</p>
            <p className="invite-world-tagline">
              ثلاثة مجالات — منظومة واحدة — حيث تُصنع قصص التقنية بأسلوب لا يُنسى.
            </p>
          </section>
        ) : null}

        {step >= 6 ? (
          <section ref={pillarsRef} className="invite-world-pillars invite-world-step-in">
            <div className="invite-pillars-grid invite-pillars-grid--world">
              {PILLARS.map((p) => (
                <div
                  key={p.id}
                  className={`invite-pillar-card invite-pillar-card--world ${pillarsVisible || reducedMotion ? "is-visible" : ""}`}
                  style={{ transitionDelay: `${p.delay}ms` }}
                >
                  <span className="invite-pillar-icon invite-pillar-icon--pulse">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <span className="invite-pillar-beam" aria-hidden />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {step >= 7 ? (
          <section className="invite-world-actions invite-world-step-in">
            <DownloadInviteButton card={card} origin={origin} label="احفظ بطاقتك الرقمية" large />
            {isCreatorProgramInvite(card.tier) ? (
              <a
                href={`/ar/growth/register?invite=${encodeURIComponent(card.slug)}`}
                className="invite-cta-ceremony invite-world-cta-link"
              >
                فعّل ASCEND — غرفة الصنّاع ←
              </a>
            ) : (
              <a href="https://tenegta.com" className="invite-cta-ceremony invite-world-cta-link">
                استكشف TENEGTA ←
              </a>
            )}
            <p className="invite-world-token">مرجع دعوتك · {card.token}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
