"use client";

import { useEffect, useRef, useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { AccessTokenCard } from "@/components/invite/AccessTokenCard";
import { DownloadInviteButton } from "@/components/invite/DownloadInviteButton";
import { LetterReveal } from "@/components/invite/LetterReveal";
import { useIntersectionReveal } from "@/components/invite/hooks/useIntersectionReveal";
import { useParallax } from "@/components/invite/hooks/useParallax";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";
import { playAcceptChime } from "@/lib/invite/invite-sound";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

type Props = {
  card: InviteCardPublic;
  origin: string;
};

const BENEFITS = [
  "منصة صانعي محتوى بأدوات ومجتمع عربي راقٍ",
  "شراكات نوعية مع TENEGTA في مشاريع تقنية",
  "تجربة بصرية سينمائية تعكس تميّزك",
  "دعم مخصص ومسارات نمو واضحة",
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
    <div className="invite-cta-pulse-wrap relative inline-flex">
      {!granted && !accepting ? (
        <>
          <span className="invite-pulse-ring" aria-hidden />
          <span className="invite-pulse-ring" style={{ animationDelay: "1s" }} aria-hidden />
        </>
      ) : null}
      <button
        type="button"
        disabled={accepting || granted}
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
  const scrollY = useParallax(!reducedMotion);
  const { accepting, acceptError, setAccepting, setAcceptError, enterWorld } =
    useInviteExperienceStore();
  const [hideScrollHint, setHideScrollHint] = useState(false);
  const granted = card.accepted;
  const inviteUrl = `${origin}/invite/${card.slug}`;
  const year = new Date().getFullYear();

  const messageRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const acceptRef = useRef<HTMLElement>(null);
  const messageVisible = useIntersectionReveal(messageRef);
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
    <div className="relative z-10 pb-32 lg:pb-0">
      {/* Section 1 — Hero */}
      <section className="invite-hero-section relative flex flex-col items-center justify-center overflow-hidden px-5 text-center sm:px-8">
        <div
          className="invite-aurora-blob-1 pointer-events-none absolute -end-20 -top-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,146,42,0.18),transparent_70%)] blur-[80px]"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          aria-hidden
        />
        <div
          className="invite-aurora-blob-2 pointer-events-none absolute -bottom-32 -start-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(107,33,168,0.15),transparent_70%)] blur-[80px]"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          aria-hidden
        />
        <div
          className="invite-aurora-blob-3 pointer-events-none absolute start-1/2 top-1/3 h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[60px]"
          style={{ transform: `translate(-50%, ${scrollY * 0.15}px)` }}
          aria-hidden
        />

        <div
          className="relative z-10 max-w-3xl"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <p className="invite-eyebrow invite-reveal-up mb-6">
            TENEGTA ASCEND · دعوة خاصة · {year}
          </p>
          <p className="invite-font-arabic text-xl text-[var(--gold-light)]">مرحباً،</p>
          <div className="invite-gold-line mx-auto my-4 max-w-[200px]" />
          <h1 className="invite-hero-name invite-text-shimmer mt-2">
            <LetterReveal text={card.name} shimmer staggerMs={50} />
          </h1>
          <p
            className="invite-font-arabic mt-6 text-base tracking-[0.5em] text-[var(--purple-light)] uppercase sm:text-lg"
            style={{ animation: "invite-reveal-up 0.8s 0.6s cubic-bezier(0.16,1,0.3,1) forwards", opacity: 0 }}
          >
            {card.tier}
          </p>
          {granted ? (
            <p className="mt-4 inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-xs font-bold text-emerald-300">
              تم قبول الدعوة
            </p>
          ) : null}
        </div>

        {!hideScrollHint ? (
          <div className="invite-scroll-hint absolute bottom-10 z-10 text-[var(--text-sub)]">
            <p className="text-xs tracking-[0.18em]">مرر للاستكشاف</p>
            <p className="mt-1 text-xl">↓</p>
          </div>
        ) : null}
      </section>

      {/* Section 2 — VIP Card + Message */}
      <section className="relative px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-6">
            <AccessTokenCard card={card} inviteUrl={inviteUrl} />
            <DownloadInviteButton card={card} origin={origin} />
          </div>

          <article ref={messageRef} className={messageVisible ? "invite-reveal-visible invite-reveal-up" : "opacity-0"}>
            <p className="invite-quote-mark leading-none">«</p>
            <div className="invite-quote mt-2">
              <p className="invite-font-arabic text-lg leading-[2]">{card.message}</p>
            </div>
            <div className="invite-gold-line my-8" />
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[var(--gold-light)]">
              لماذا أنت هنا
            </p>
            <ul className="space-y-4">
              {BENEFITS.map((text, i) => (
                <li
                  key={text}
                  className={`invite-benefit-row flex items-start gap-3 ${messageVisible ? "is-visible" : ""}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <span className="invite-benefit-dot mt-2" aria-hidden />
                  <span className="text-[var(--text-sub)]">{text}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Section 3 — Journey */}
      <section
        ref={journeyRef}
        className="border-t border-white/5 bg-[var(--surface)] px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="invite-section-title mb-12">رحلتك تبدأ هنا</h2>
          <div
            className={`invite-journey-line mb-10 hidden md:block ${journeyVisible ? "is-visible" : ""}`}
            aria-hidden
          />
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <p className="invite-step-num-bg absolute -top-4 start-1/2 -translate-x-1/2 select-none">
                  {step.num}
                </p>
                <div className={`invite-step-circle mx-auto ${journeyVisible ? "is-visible" : ""}`}
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

      {/* Section 4 — Acceptance */}
      <section
        ref={acceptRef}
        className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 py-20 text-center sm:px-8"
      >
        <div
          className={`relative mb-10 size-[200px] ${acceptVisible ? "" : "opacity-0"}`}
          aria-hidden
        >
          <div className="invite-pulse-ring absolute inset-0 rounded-full border border-[var(--gold)]/30" />
          <div
            className="invite-pulse-ring absolute inset-4 rounded-full border border-[var(--gold)]/20"
            style={{ animationDelay: "1s" }}
          />
          <svg className="invite-sigil-outer absolute inset-0" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(201,146,42,0.4)" strokeWidth="1" strokeDasharray="8 12" />
          </svg>
          <svg className="invite-sigil-inner absolute inset-6" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(228,184,77,0.5)" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="invite-font-display text-4xl text-[var(--gold-light)]">T</span>
          </div>
          {[0, 90, 180, 270].map((deg, i) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold-light)]"
              style={{
                animation: `invite-orbit-dot ${8 + i * 2}s linear infinite`,
                transformOrigin: "0 90px",
                transform: `rotate(${deg}deg)`,
              }}
            />
          ))}
        </div>

        <h2 className={`invite-font-arabic text-3xl font-bold ${acceptVisible ? "invite-reveal-up" : "opacity-0"}`}>
          هل أنت مستعد؟
        </h2>
        <p className="mt-4 max-w-md text-base text-[var(--text-sub)]">
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

      {/* Sticky mobile CTA */}
      <div className="invite-sticky-cta invite-safe-bottom fixed inset-x-0 bottom-0 z-30 px-4 pt-8 sm:hidden">
        {acceptError ? <p className="mb-2 text-center text-xs text-rose-400">{acceptError}</p> : null}
        <div className="flex justify-center">
          <AcceptButton granted={granted} accepting={accepting} onAccept={() => void onAccept()} />
        </div>
      </div>
    </div>
  );
}
