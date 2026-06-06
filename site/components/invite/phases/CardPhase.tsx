"use client";

import { useEffect, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { AccessTokenCard } from "@/components/invite/AccessTokenCard";
import { DownloadInviteButton } from "@/components/invite/DownloadInviteButton";
import { useIntersectionReveal } from "@/components/invite/hooks/useIntersectionReveal";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";
import { playAcceptChime } from "@/lib/invite/invite-sound";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

import { InviteBenefitIcon } from "@/components/invite/InviteBenefitIcon";
import { benefitsForTier } from "@/lib/invite/message-templates";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

const STEPS = [
  { num: "١", title: "اقبل", desc: "تأكيد حضورك" },
  { num: "٢", title: "استكشف", desc: "رؤية TENEGTA" },
  { num: "٣", title: "انطلق", desc: "ابدأ رحلتك" },
];

function AcceptButton({
  granted,
  accepting,
  onAccept,
}: {
  granted: boolean;
  accepting: boolean;
  onAccept: () => void;
}) {
  let label = "أقبل الدعوة بامتنان";
  if (accepting) label = "·  ·  ·";
  if (granted) label = "تم القبول ✦";

  return (
    <div className="invite-cta-pulse-wrap relative mx-auto inline-flex">
      {!granted && !accepting ? (
        <>
          <span className="invite-pulse-ring" aria-hidden />
          <span className="invite-pulse-ring" style={{ animationDelay: "1.5s" }} aria-hidden />
        </>
      ) : null}
      <button
        type="button"
        disabled={accepting}
        onClick={onAccept}
        className={`invite-cta-ceremony ${accepting ? "is-loading" : ""} ${granted ? "is-accepted" : ""}`}
      >
        {label}
      </button>
    </div>
  );
}

function SceneDivider({ label }: { label: string }) {
  return (
    <div className="invite-scene-divider" aria-hidden>
      <span className="invite-scene-divider-line" />
      <span className="invite-scene-label">{label}</span>
      <span className="invite-scene-divider-line" />
    </div>
  );
}

export function CardPhase({ card, origin }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { accepting, acceptError, setAccepting, setAcceptError, startAcceptMontage, enterWorld } =
    useInviteExperienceStore();
  const [hideScrollHint, setHideScrollHint] = useState(false);
  const granted = card.accepted;
  const year = new Date().getFullYear();
  const benefits = benefitsForTier(card.tier);

  const storyRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const acceptRef = useRef<HTMLElement>(null);
  const storyVisible = useIntersectionReveal(storyRef, { threshold: 0.15 });
  const journeyVisible = useIntersectionReveal(journeyRef, { threshold: 0.2 });
  const acceptVisible = useIntersectionReveal(acceptRef, { threshold: 0.2 });

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 24) setHideScrollHint(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToWorld = () => {
    if (reducedMotion) {
      enterWorld();
      return;
    }
    startAcceptMontage();
  };

  const onAccept = async () => {
    if (granted) {
      goToWorld();
      return;
    }
    setAccepting(true);
    setAcceptError(null);
    playAcceptChime();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
    try {
      const res = await fetch(`/api/invite/${card.slug}/accept`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setAcceptError(data.error ?? "تعذّر تأكيد الدعوة");
        return;
      }
      goToWorld();
    } catch {
      setAcceptError("تحقق من الاتصال وحاول مجدداً");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="invite-flow relative z-10 mx-auto w-full pb-28 lg:pb-12" dir="rtl">
      {/* ACT I — Arrival: name + card in one cinematic beat */}
      <section className="invite-scene invite-scene--opening">
        <div className="invite-hero-glow" aria-hidden />
        <div className="invite-page-container">
          <p className="invite-scene-act">ACT I · الوصول</p>
          <div className="invite-hero-line" aria-hidden />
          <p className="invite-eyebrow invite-reveal-up">TENEGTA ASCEND · {year}</p>
          <p className="invite-hero-greeting invite-text-shimmer">TENEGTA</p>
          <h1 className="invite-hero-name">{card.name}</h1>
          <p className="invite-tier-label">◆ {card.tier.toUpperCase()} ◆</p>
          {granted ? (
            <p className="invite-badge-accepted">تم قبول الدعوة</p>
          ) : null}

          <div className="invite-opening-card">
            <AccessTokenCard card={card} variant="luxury" revealed />
            <DownloadInviteButton card={card} origin={origin} />
          </div>
        </div>

        {!hideScrollHint && !reducedMotion ? (
          <div className="invite-scroll-hint">
            <span>اكتشف رسالتك</span>
            <span className="invite-scroll-hint-arrow">↓</span>
          </div>
        ) : null}
      </section>

      <SceneDivider label="الرسالة" />

      {/* ACT II — Story + benefits in one glass panel */}
      <section
        ref={storyRef}
        className={`invite-scene invite-scene--story ${storyVisible ? "invite-reveal-section is-visible" : "invite-reveal-section"}`}
      >
        <div className="invite-page-container">
          <p className="invite-scene-act">ACT II · الدعوة</p>
          <div className="invite-cinema-panel">
            <span className="invite-message-quotes-open" aria-hidden>
              «
            </span>
            <span className="invite-message-quotes-close" aria-hidden>
              »
            </span>
            <p className="invite-message-text">{card.message}</p>
            <div className="invite-panel-rule" aria-hidden />
            <h2 className="invite-benefits-title">ما يمنحك إياه البرنامج</h2>
            <div className="invite-benefits-grid invite-benefits-grid--compact">
              {benefits.map((item, i) => (
                <div
                  key={item.label}
                  className={`invite-benefit-card invite-benefit-card--compact ${storyVisible ? "is-visible" : ""}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="invite-benefit-icon">
                    <InviteBenefitIcon icon={item.icon} />
                  </span>
                  <p className="invite-benefit-label">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SceneDivider label="الرحلة" />

      {/* ACT III — Compact journey strip */}
      <section
        ref={journeyRef}
        className={`invite-scene invite-scene--journey ${journeyVisible ? "invite-reveal-section is-visible" : "invite-reveal-section"}`}
      >
        <div className="invite-page-container">
          <p className="invite-scene-act">ACT III · المسار</p>
          <h2 className="invite-section-title">ثلاث خطوات — ثم العالم</h2>
          <div className="invite-journey-strip">
            {STEPS.map((step, i) => (
              <div key={step.title} className="invite-journey-step">
                <span className="invite-journey-num">{step.num}</span>
                <div>
                  <h3 className="invite-journey-title">{step.title}</h3>
                  <p className="invite-journey-desc">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 ? (
                  <span className="invite-journey-connector" aria-hidden>
                    ◆
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SceneDivider label={granted ? "العالم" : "القبول"} />

      {/* ACT IV — Acceptance or re-entry */}
      <section
        ref={acceptRef}
        className={`invite-scene invite-scene--accept ${acceptVisible ? "invite-reveal-section is-visible" : "invite-reveal-section"}`}
      >
        <div className="invite-page-container">
          <p className="invite-scene-act">ACT IV · {granted ? "العودة" : "التأكيد"}</p>

          <div className="invite-accept-stage">
            <div className={`invite-sigil-wrap invite-sigil-wrap--compact ${acceptVisible ? "" : "opacity-0"}`} aria-hidden>
              <span className="invite-pulse-ring absolute inset-0 rounded-full" />
              <svg className="invite-sigil-outer absolute inset-0" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(201,146,42,0.35)" strokeWidth="1" strokeDasharray="4 8" />
              </svg>
              <svg className="invite-sigil-middle absolute inset-6" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="0.5" />
              </svg>
              <svg className="absolute inset-0" viewBox="0 0 200 200">
                <text x="100" y="107" textAnchor="middle" fontSize="32" fill="#E4B84D" fontFamily="Cormorant Garamond, Georgia, serif">
                  T
                </text>
              </svg>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className="invite-orbit-dot"
                  style={{ animation: `invite-orbit-cw-${n} ${8 + (n - 1) * 4}s linear infinite` }}
                />
              ))}
            </div>

            <h2 className="invite-accept-heading">
              {granted ? "عالمك ينتظرك" : "هل أنت مستعد؟"}
            </h2>
            <p className="invite-accept-copy">
              {granted
                ? "دعوتك مؤكدة — ادخل إلى احتفال TENEGTA"
                : "بقبولك، تنضم رسمياً كضيف مميز — دون إنشاء حساب شريك."}
            </p>

            {acceptError ? (
              <p className="invite-accept-error hidden sm:block">{acceptError}</p>
            ) : null}

            <div className="invite-accept-cta hidden sm:block">
              <AcceptButton granted={granted} accepting={accepting} onAccept={() => void onAccept()} />
            </div>
          </div>
        </div>
      </section>

      <div className="invite-sticky-cta invite-safe-bottom px-4 pt-6 sm:hidden">
        {acceptError ? <p className="invite-accept-error mb-2 text-center">{acceptError}</p> : null}
        <AcceptButton granted={granted} accepting={accepting} onAccept={() => void onAccept()} />
      </div>
    </div>
  );
}
