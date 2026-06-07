"use client";

import { useEffect, useState } from "react";
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

const BAR_KEYS = ["barBooking", "barDatabase", "barHall1", "barHall2", "barHall3"] as const;

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
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const typewriterDelay = mounted && reduced ? 0 : 120;
  const { visibleLines, done, cursorVisible } = useTypewriter(POST_LINES, typewriterDelay, stage === 0);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted, reduced, setBootStage, soundEnabled]);

  useEffect(() => {
    if (stage !== 1) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setBarFill(i);
      if (i >= BAR_KEYS.length) clearInterval(id);
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
          {BAR_KEYS.map((key, i) => (
            <div key={key} className={`cinema-boot-bar-row ${i < barFill ? "is-filled" : ""}`}>
              <span>{t(`boot.${key}`)}</span>
              <div className="cinema-boot-bar-track">
                <div className="cinema-boot-bar-fill" style={{ width: i < barFill ? "100%" : "0%" }} />
              </div>
              <span>{i < barFill ? "100%" : ""}</span>
            </div>
          ))}
        </div>
      ) : null}

      {stage === 2 ? (
        <div className="cinema-boot-auth">
          <div className="cinema-boot-auth-glow" aria-hidden />
          <CinemaBrandLogo variant="dark" className="cinema-boot-logo" />
          <p className="cinema-boot-auth-kicker">{t("boot.opsCenterAr")}</p>
          <h1>{t("boot.opsCenterEn")}</h1>
          <p className="cinema-boot-auth-sub">{t("boot.authSubtitle")}</p>

          <div className="cinema-boot-login-card">
            <div className="cinema-boot-login-head">
              <span className="cinema-boot-login-avatar" aria-hidden>
                {t("boot.loginAvatar")}
              </span>
              <div>
                <strong>{t("boot.loginName")}</strong>
                <span className="cinema-boot-login-branch">{t("boot.loginBranch")}</span>
              </div>
            </div>

            <dl className="cinema-boot-login-rows">
              <div className="cinema-boot-login-row">
                <dt>{t("boot.loginUserLabel")}</dt>
                <dd>
                  <bdi dir="rtl">{t("boot.loginUserEmail")}</bdi>
                </dd>
              </div>
              <div className="cinema-boot-login-row">
                <dt>{t("boot.loginRoleLabel")}</dt>
                <dd>{t("boot.loginRoleValue")}</dd>
              </div>
              <div className="cinema-boot-login-row">
                <dt>{t("boot.loginLevelLabel")}</dt>
                <dd>{t("boot.loginLevelValue")}</dd>
              </div>
            </dl>

            <p className="cinema-boot-verified">
              <span className="cinema-boot-verified-dot" aria-hidden />
              {t("boot.loginVerified")}
            </p>
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
            <p className="cinema-boot-scan-label">
              {scanPct >= 100 ? t("boot.fingerprintDone") : t("boot.fingerprintScanning", { pct: scanPct })}
            </p>
          </div>
        </div>
      ) : null}

      {stage >= 3 ? (
        <div className="cinema-boot-desktop-preview">
          <div className="cinema-boot-topbar">
            <span suppressHydrationWarning>
              {t("boot.previewTopbar", { clock: clock || "—" })}
            </span>
          </div>
          <div className="cinema-boot-widgets">
            <div className="cinema-boot-widget">
              <span>{t("boot.widgetRevenue")}</span>
              <strong>{t("boot.widgetRevenueValue")}</strong>
            </div>
            <div className="cinema-boot-widget cinema-boot-widget--wide">
              <span>{t("boot.widgetScreens")}</span>
              <strong>{t("boot.widgetScreensValue")}</strong>
            </div>
            <div className="cinema-boot-widget">
              <span>{t("boot.widgetAlerts")}</span>
              <strong>{t("boot.widgetAlertsValue")}</strong>
            </div>
          </div>
        </div>
      ) : null}

      {stage >= 4 ? (
        <div className="cinema-boot-briefing">
          <p className="cinema-boot-briefing-title">{t("boot.briefingTitle")}</p>
          <div className="cinema-boot-brief-cards">
            <article>
              {t("boot.briefHall1")}
              <br />
              {t("boot.briefHall1Detail")}
            </article>
            <article>
              {t("boot.briefHall2")}
              <br />
              {t("boot.briefHall2Detail")}
            </article>
            <article className="cinema-boot-alert">{t("boot.briefAlert")}</article>
          </div>
          <p className="cinema-boot-ready">{t("boot.readyPrompt")}</p>
          <button type="button" className="cinema-boot-cta" onClick={startSession}>
            {t("boot.startSession")}
          </button>
        </div>
      ) : null}

      {stage < 4 ? (
        <button type="button" className="cinema-splash-skip" onClick={startSession}>
          {t("splash.skip")}
        </button>
      ) : null}
    </section>
  );
}
