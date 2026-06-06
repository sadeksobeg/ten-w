"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { useTypewriter } from "@/components/cinema-demo/hooks/useTypewriter";
import { playAuthSuccess, playBootBeep } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

const POST_LINES = [
  "SALAMIYA CINEMA OS v4.2.1",
  "Copyright © 2026 TENEGTA Systems",
  "Initializing hardware interfaces...",
  "  ✓ Display controller: 4K ready",
  "  ✓ Network: 1Gbps connected",
  "  ✓ Payment terminal: online",
  "  ✓ Projector array: 3 units ready",
  "  ✓ HVAC control: nominal",
  "Loading cinema management kernel...",
];

const BAR_ITEMS = [
  { label: "نظام الحجز", pct: 100 },
  { label: "قاعدة البيانات", pct: 100 },
  { label: "قاعة 1 IMAX", pct: 100 },
  { label: "قاعة 2 VIP", pct: 100 },
  { label: "قاعة 3", pct: 100 },
];

export function CinemaBootOS() {
  const t = useTranslations("CinemaDemo");
  const setPhase = useCinemaDemoStore((s) => s.setPhase);
  const setBootStage = useCinemaDemoStore((s) => s.setBootStage);
  const setOsReady = useCinemaDemoStore((s) => s.setOsReady);
  const setSessionStartedAt = useCinemaDemoStore((s) => s.setSessionStartedAt);
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const [stage, setStage] = useState(0);
  const [barFill, setBarFill] = useState(0);
  const [scanPct, setScanPct] = useState(0);
  const [flash, setFlash] = useState(false);
  const [clock, setClock] = useState("");

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const { visibleLines, done, cursorVisible } = useTypewriter(POST_LINES, reduced ? 0 : 120, stage === 0);

  useEffect(() => {
    const timings = reduced ? [0, 400, 800, 1200, 1600] : [0, 2000, 5000, 8000, 12000];
    const timers = timings.map((ms, i) =>
      window.setTimeout(() => {
        setStage(i);
        setBootStage(i);
        if (i === 1) playBootBeep(soundEnabled);
        if (i === 2) playAuthSuccess(soundEnabled);
        if (i === 3) setFlash(true);
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduced, setBootStage, soundEnabled]);

  useEffect(() => {
    if (stage !== 1) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setBarFill(i);
      if (i >= BAR_ITEMS.length) clearInterval(id);
    }, reduced ? 80 : 200);
    return () => clearInterval(id);
  }, [stage, reduced]);

  useEffect(() => {
    if (stage !== 2) return;
    let p = 0;
    const id = window.setInterval(() => {
      p += 8;
      setScanPct(Math.min(100, p));
      if (p >= 100) clearInterval(id);
    }, reduced ? 30 : 60);
    return () => clearInterval(id);
  }, [stage, reduced]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const startSession = () => {
    setOsReady(true);
    setSessionStartedAt(Date.now());
    setPhase("movies");
  };

  return (
    <section className={`cinema-boot cinema-boot--stage-${stage}`} aria-label={t("boot.aria")}>
      {flash ? <div className="cinema-boot-flash" aria-hidden /> : null}

      {stage === 0 ? (
        <div className="cinema-boot-post">
          {visibleLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {done && cursorVisible ? <span className="cinema-boot-cursor">▌</span> : null}
        </div>
      ) : null}

      {stage === 1 ? (
        <div className="cinema-boot-bars">
          {BAR_ITEMS.map((bar, i) => (
            <div key={bar.label} className={`cinema-boot-bar-row ${i < barFill ? "is-filled" : ""}`}>
              <span>{bar.label}</span>
              <div className="cinema-boot-bar-track">
                <div className="cinema-boot-bar-fill" style={{ width: i < barFill ? `${bar.pct}%` : "0%" }} />
              </div>
              <span>{i < barFill ? `${bar.pct}%` : ""}</span>
            </div>
          ))}
        </div>
      ) : null}

      {stage === 2 ? (
        <div className="cinema-boot-auth">
          <CinemaBrandLogo variant="dark" className="cinema-boot-logo" />
          <h1>CINEMA OPERATIONS CENTER</h1>
          <p>مركز عمليات سينما سلمية</p>
          <div className="cinema-boot-login-card">
            <p>المستخدم: مدير@سلمية.com</p>
            <p>الصلاحية: مدير عمليات</p>
            <p>المستوى: مدير أول</p>
            <p className="cinema-boot-verified">✓ تم التحقق</p>
          </div>
          <div className="cinema-boot-fingerprint">
            <svg viewBox="0 0 64 80" aria-hidden>
              <path
                d="M32 4c-8 0-14 6-14 14v8M32 4c8 0 14 6 14 14v8M18 26v12M46 26v12M12 42v14M52 42v14M16 58c0 9 7 16 16 16s16-7 16-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                className="cinema-boot-scan-fill"
                x="8"
                y="0"
                width="48"
                height={80 * (scanPct / 100)}
                fill="rgba(201,146,42,0.35)"
              />
            </svg>
            {scanPct >= 100 ? <p>تم التعرف على البصمة</p> : null}
          </div>
        </div>
      ) : null}

      {stage >= 3 ? (
        <div className="cinema-boot-desktop-preview">
          <div className="cinema-boot-topbar">
            <span>سينما سلمية · النظام الحي · {clock}</span>
          </div>
          <div className="cinema-boot-widgets">
            <div className="cinema-boot-widget" />
            <div className="cinema-boot-widget cinema-boot-widget--wide" />
            <div className="cinema-boot-widget" />
          </div>
        </div>
      ) : null}

      {stage >= 4 ? (
        <div className="cinema-boot-briefing">
          <p className="cinema-boot-briefing-title">الوضع الحالي في السينما:</p>
          <div className="cinema-boot-brief-cards">
            <article>قاعة 1: تعرض الآن — كثيب الجزء الثالث<br />78% ممتلئة — تنتهي في 74 دقيقة</article>
            <article>قاعة 2 VIP: العرض القادم في 47 دقيقة<br />تم بيع 89% من التذاكر</article>
            <article className="cinema-boot-alert">تنبيه: وصلت 12 حجز في آخر 5 دقائق</article>
          </div>
          <p className="cinema-boot-ready">مستعد للتحكم؟</p>
          <button type="button" className="cinema-boot-cta" onClick={startSession}>
            {t("boot.startSession")}
          </button>
        </div>
      ) : null}

      {!reduced && stage < 4 ? (
        <button type="button" className="cinema-splash-skip" onClick={startSession}>
          {t("splash.skip")}
        </button>
      ) : null}
    </section>
  );
}
