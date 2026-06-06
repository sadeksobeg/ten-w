"use client";

import { useEffect, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { AccessTokenCard } from "@/components/invite/AccessTokenCard";
import { DownloadInviteButton } from "@/components/invite/DownloadInviteButton";
import { useIntersectionReveal } from "@/components/invite/hooks/useIntersectionReveal";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";
import { playAcceptChime } from "@/lib/invite/invite-sound";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

const BENEFITS = [
  {
    label: "وصول حصري للشبكة",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M12 7v4M8.5 17.5L10.5 13M15.5 17.5L13.5 13" />
      </svg>
    ),
  },
  {
    label: "تعاون مع الفريق",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "محتوى مميز ومدفوع",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    ),
  },
  {
    label: "شراكة طويلة المدى",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7" />
        <path d="M5 12H2M5 12c0 3.87-3.13 7-7 7" transform="translate(7 0)" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: "١",
    title: "اقبل الدعوة",
    desc: "تأكيد حضورك يفتح تجربتك الشخصية.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    num: "٢",
    title: "استكشف العالم",
    desc: "تعرّف على رؤية TENEGTA ومجالات عملها.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    num: "٣",
    title: "ابدأ رحلتك",
    desc: "انضم كضيف مميز واستعد للخطوة التالية.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    ),
  },
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

export function CardPhase({ card, origin }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { accepting, acceptError, setAccepting, setAcceptError, enterWorld } =
    useInviteExperienceStore();
  const [hideScrollHint, setHideScrollHint] = useState(false);
  const granted = card.accepted;
  const year = new Date().getFullYear();

  const messageRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const acceptRef = useRef<HTMLElement>(null);
  const messageVisible = useIntersectionReveal(messageRef, { threshold: 0.3 });
  const benefitsVisible = useIntersectionReveal(benefitsRef, { threshold: 0.3 });
  const journeyVisible = useIntersectionReveal(journeyRef);
  const acceptVisible = useIntersectionReveal(acceptRef);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setHideScrollHint(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onAccept = async () => {
    if (granted) {
      enterWorld();
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
      enterWorld();
    } catch {
      setAcceptError("تحقق من الاتصال وحاول مجدداً");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="invite-main-scroll relative z-10 mx-auto w-full pb-32 lg:pb-0" dir="rtl">
      {/* Hero */}
      <section className="invite-hero-section invite-snap-section">
        <div className="invite-page-container relative z-10 w-full">
          <div className="invite-hero-line" aria-hidden />
          <p className="invite-eyebrow invite-reveal-up mb-6">
            TENEGTA ASCEND · دعوة خاصة · {year}
          </p>
          <p className="invite-font-arabic text-xl text-[var(--gold-light)]">مرحباً</p>
          <div className="invite-hero-divider" aria-hidden />
          <h1 className="invite-hero-name mt-2">{card.name}</h1>
          <p className="invite-tier-label mt-6">
            ◆ {card.tier.toUpperCase()} ◆
          </p>
          {granted ? (
            <p className="mt-6 inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-xs font-bold text-emerald-300">
              تم قبول الدعوة
            </p>
          ) : null}
        </div>

        {!hideScrollHint && !reducedMotion ? (
          <div className="invite-scroll-hint absolute bottom-10 z-10 text-[var(--text-sub)]">
            <p className="text-xs tracking-[0.18em]">مرر للاستكشاف</p>
            <p className="mt-1 text-xl">↓</p>
          </div>
        ) : null}
      </section>

      {/* VIP Card */}
      <section className="invite-snap-section py-16">
        <div className="invite-page-container flex flex-col items-center gap-6">
          <AccessTokenCard card={card} />
          <DownloadInviteButton card={card} origin={origin} />
        </div>
      </section>

      {/* Message */}
      <section
        ref={messageRef}
        className={`invite-message-section invite-snap-section ${messageVisible ? "invite-reveal-section is-visible" : "invite-reveal-section"}`}
      >
        <span className="invite-message-quotes-open" aria-hidden>
          «
        </span>
        <span className="invite-message-quotes-close" aria-hidden>
          »
        </span>
        <p className="invite-message-text">{card.message}</p>
      </section>

      {/* Benefits */}
      <section ref={benefitsRef} className="invite-benefits-section invite-snap-section">
        <h2 className="invite-benefits-title">ما يمنحك إياه هذا البرنامج</h2>
        <div className="invite-benefits-grid">
          {BENEFITS.map((item, i) => (
            <div
              key={item.label}
              className={`invite-benefit-card ${benefitsVisible ? "is-visible" : ""}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span className="invite-benefit-icon">{item.icon}</span>
              <p className="invite-benefit-label">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section
        ref={journeyRef}
        className="invite-snap-section border-t border-white/5 bg-[var(--surface)] py-20"
      >
        <div className="invite-page-container">
          <h2 className="invite-section-title mb-12">رحلتك تبدأ هنا</h2>
          <div
            className={`invite-journey-line mb-10 hidden md:block ${journeyVisible ? "is-visible" : ""}`}
            aria-hidden
          />
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <p className="invite-step-num-bg absolute -top-4 left-1/2 -translate-x-1/2 select-none">
                  {step.num}
                </p>
                <div
                  className={`invite-step-circle mx-auto ${journeyVisible ? "is-visible" : ""}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <span className="text-[var(--gold-light)]">{step.icon}</span>
                </div>
                <h3 className="mt-4 font-bold text-[var(--text)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-sub)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return to celebration (already accepted) */}
      {granted ? (
        <section className="invite-snap-section flex flex-col items-center py-20 text-center">
          <p className="mb-6 text-[var(--text-sub)]">دعوتك مؤكدة — استكمل استكشاف عالم TENEGTA</p>
          <AcceptButton granted={granted} accepting={accepting} onAccept={() => enterWorld()} />
        </section>
      ) : null}

      {/* Acceptance */}
      {!granted ? (
        <section
          ref={acceptRef}
          className="invite-snap-section relative flex min-h-[100dvh] flex-col items-center justify-center py-20 text-center"
        >
          <div className={`invite-sigil-wrap ${acceptVisible ? "" : "opacity-0"}`} aria-hidden>
            <span className="invite-pulse-ring absolute inset-0 rounded-full" />
            <span
              className="invite-pulse-ring absolute inset-4 rounded-full"
              style={{ animationDelay: "1.5s" }}
            />
            <svg className="invite-sigil-outer absolute inset-0" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="none"
                stroke="rgba(201,146,42,0.3)"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
            </svg>
            <svg className="invite-sigil-middle absolute inset-6" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="none"
                stroke="rgba(168,85,247,0.2)"
                strokeWidth="0.5"
              />
            </svg>
            <svg className="invite-sigil-inner absolute inset-12" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="55"
                fill="none"
                stroke="rgba(201,146,42,0.4)"
                strokeWidth="1"
              />
            </svg>
            <svg className="absolute inset-0" viewBox="0 0 200 200">
              <text
                x="100"
                y="107"
                textAnchor="middle"
                fontSize="32"
                fill="#E4B84D"
                fontFamily="Cormorant Garamond, Georgia, serif"
              >
                T
              </text>
            </svg>
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className="invite-orbit-dot"
                style={{
                  animation: `invite-orbit-cw-${n} ${8 + (n - 1) * 4}s linear infinite`,
                }}
              />
            ))}
          </div>

          <h2
            className={`invite-font-arabic text-3xl font-bold ${acceptVisible ? "invite-reveal-up" : "opacity-0"}`}
          >
            هل أنت مستعد؟
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-[var(--text-sub)]">
            بقبولك الدعوة، تنضم رسمياً إلى عالم TENEGTA
          </p>

          {acceptError ? <p className="mt-4 text-sm text-rose-400">{acceptError}</p> : null}

          <div className="mt-10 hidden sm:block">
            <AcceptButton granted={granted} accepting={accepting} onAccept={() => void onAccept()} />
            <p className="mt-4 text-xs text-white/35">
              بالضغط، تؤكد حضورك كضيف مميز — دون إنشاء حساب شريك تلقائياً.
            </p>
          </div>
        </section>
      ) : null}

      {/* Sticky mobile CTA */}
      {!granted ? (
        <div className="invite-sticky-cta invite-safe-bottom px-4 pt-8 sm:hidden">
          {acceptError ? (
            <p className="mb-2 text-center text-xs text-rose-400">{acceptError}</p>
          ) : null}
          <AcceptButton granted={granted} accepting={accepting} onAccept={() => void onAccept()} />
        </div>
      ) : null}
    </div>
  );
}
