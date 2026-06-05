"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import { AccessTokenCard } from "@/components/invite/AccessTokenCard";
import { useInviteExperienceStore } from "@/stores/invite-experience-store";

type Props = {
  card: InviteCardPublic;
};

const BENEFITS = [
  {
    icon: "✦",
    title: "منصة صانعي محتوى",
    desc: "أدوات، محتوى، ومجتمع مصمّم لصناع القصة الرقمية في العالم العربي.",
  },
  {
    icon: "◈",
    title: "شراكات نوعية",
    desc: "فرص تعاون حقيقية مع TENEGTA في مشاريع تقنية وقصصية مؤثرة.",
  },
  {
    icon: "◎",
    title: "تجربة سينمائية",
    desc: "هوية بصرية فاخرة تعكس قيمة صوتك وتميّزك أمام جمهورك.",
  },
  {
    icon: "❋",
    title: "دعم مخصص",
    desc: "فريق يتابع رحلتك ويفتح لك مسارات نمو واضحة من اليوم الأول.",
  },
];

const STEPS = [
  { title: "اقبل الدعوة", desc: "تأكيد حضورك يفتح تجربتك الشخصية." },
  { title: "استكشف العالم", desc: "تعرّف على رؤية TENEGTA ومجالات عملها." },
  { title: "ابدأ رحلتك", desc: "انضم كضيف مميز واستعد للخطوة التالية." },
];

export function CardPhase({ card }: Props) {
  const reduceMotion = useReducedMotion();
  const { accepting, acceptError, setAccepting, setAcceptError, enterWorld } =
    useInviteExperienceStore();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [revealed, setRevealed] = useState(Boolean(reduceMotion));
  const granted = card.accepted;

  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setTimeout(() => setRevealed(true), 300);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion || window.matchMedia("(max-width: 639px)").matches) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rotateX: -y * 10, rotateY: x * 12 });
    },
    [reduceMotion],
  );

  const onAccept = async () => {
    if (granted) {
      enterWorld();
      return;
    }
    setAccepting(true);
    setAcceptError(null);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.8 }}
      className="relative z-10"
    >
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-24 pt-16 text-center sm:px-8">
        <div className="invite-aurora absolute inset-0 opacity-70" aria-hidden />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-3xl"
        >
          <p className="invite-eyebrow mb-5">دعوة حصرية · {card.tier}</p>
          <h1 className="invite-hero-title text-white">
            مرحباً، <span className="text-[var(--invite-gold-bright)]">{card.name}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            TENEGTA تدعوك لتكون جزءاً من تجربة صناعة محتوى تقني راقٍ — حيث تلتقي
            القصة، التقنية، والتميّز في مساحة واحدة.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="invite-badge">{card.scope}</span>
            {granted ? (
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                تم قبول الدعوة
              </span>
            ) : null}
          </div>
        </motion.div>

        <div className="invite-scroll-hint absolute bottom-8 text-white/35" aria-hidden>
          <span className="text-xs tracking-[0.18em]">اكتشف دعوتك</span>
          <p className="mt-1 text-xl">↓</p>
        </div>
      </section>

      {/* VIP Card */}
      <section
        className="relative px-5 py-16 sm:px-8 sm:py-24"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="invite-eyebrow mb-3">بطاقتك الشخصية</p>
            <h2 className="invite-section-title text-white">دعوتك الرقمية</h2>
          </div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 24 }}
            animate={
              revealed
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.92, y: 24 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="[transform-style:preserve-3d]"
          >
            <AccessTokenCard card={card} tilt={tilt} />
          </motion.div>
        </div>
      </section>

      {/* Personal message */}
      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="invite-eyebrow mb-3">رسالة شخصية</p>
            <h2 className="invite-section-title text-white">كلمة من TENEGTA</h2>
          </div>
          <motion.blockquote
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="invite-quote text-center sm:text-start"
          >
            {card.message}
          </motion.blockquote>
        </div>
      </section>

      <div className="invite-gold-line mx-auto max-w-4xl opacity-80" aria-hidden />

      {/* Benefits */}
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="invite-eyebrow mb-3">لماذا TENEGTA؟</p>
            <h2 className="invite-section-title text-white">ما الذي ينتظرك</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              دعوة حديثة لصانع محتوى يريد الانتماء لعلامة تقنية عربية طموحة — بصناعة
              قصص، أدوات، وفرص حقيقية.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="invite-benefit-card"
              >
                <span className="text-2xl text-[var(--invite-gold)]" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="invite-eyebrow mb-3">خطوتك التالية</p>
            <h2 className="invite-section-title text-white">رحلة بسيطة · أثر كبير</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="invite-step text-center md:text-start"
              >
                <span className="invite-step-num">{i + 1}</span>
                <h3 className="mt-4 text-base font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline CTA (desktop scroll) */}
      <section className="hidden px-5 pb-32 pt-4 text-center sm:block sm:px-8">
        {acceptError ? <p className="mb-4 text-sm text-rose-400">{acceptError}</p> : null}
        <button
          type="button"
          disabled={accepting}
          onClick={() => void onAccept()}
          className="invite-cta-primary min-w-[260px]"
        >
          {accepting
            ? "جاري التأكيد…"
            : granted
              ? "ادخل إلى عالم TENEGTA ←"
              : "أقبل الدعوة بامتنان ←"}
        </button>
        <p className="mt-4 text-xs text-white/35">
          بالضغط، تؤكد حضورك كضيف مميز — دون إنشاء حساب شريك تلقائياً.
        </p>
      </section>

      {/* Sticky mobile CTA */}
      <div className="invite-sticky-cta fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 sm:hidden">
        {acceptError ? <p className="mb-2 text-center text-xs text-rose-400">{acceptError}</p> : null}
        <button
          type="button"
          disabled={accepting}
          onClick={() => void onAccept()}
          className="invite-cta-primary w-full"
        >
          {accepting
            ? "جاري التأكيد…"
            : granted
              ? "ادخل إلى عالم TENEGTA"
              : "أقبل الدعوة بامتنان"}
        </button>
      </div>
    </motion.div>
  );
}
