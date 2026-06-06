"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { playCountdownTick, playProjectorTick } from "@/lib/cinema-demo/sounds";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaSplashPhase() {
  const t = useTranslations("CinemaDemo");
  const setPhase = useCinemaDemoStore((s) => s.setPhase);
  const soundEnabled = useCinemaDemoStore((s) => s.soundEnabled);
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [
      window.setTimeout(() => setStep(1), reduced ? 0 : 1000),
      window.setTimeout(() => setStep(2), reduced ? 200 : 2000),
      window.setTimeout(() => setStep(3), reduced ? 400 : 4000),
      window.setTimeout(() => setStep(4), reduced ? 600 : 6000),
      window.setTimeout(() => setPhase("modeSelect"), reduced ? 800 : 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [setPhase]);

  useEffect(() => {
    if (step !== 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    playProjectorTick(soundEnabled);
    let n = 3;
    const id = window.setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n > 0) playCountdownTick(soundEnabled);
      if (n <= 0) clearInterval(id);
    }, 700);
    return () => clearInterval(id);
  }, [step, soundEnabled]);

  return (
    <section className={`cinema-splash cinema-phase cinema-splash-v2 cinema-splash-v2--step-${step}`}>
      <div className="cinema-splash-scanline" aria-hidden />
      <div className="cinema-splash-vignette" aria-hidden />

      {step === 0 ? (
        <div className="cinema-splash-countdown" aria-live="polite">
          {countdown > 0 ? countdown : "●"}
        </div>
      ) : null}

      <div className="cinema-splash-logo-wrap cinema-splash-spotlight">
        <CinemaBrandLogo variant="splash" tagline={t("modes.tagline")} />
      </div>

      <p className="cinema-splash-tag">{t("splash.tag")}</p>
      <p className="cinema-splash-system">{t("splash.systemLine")}</p>
      <p className="cinema-splash-tenegta">T.E.N.E.G.T.A</p>

      <button type="button" className="cinema-splash-skip" onClick={() => setPhase("modeSelect")}>
        {t("splash.skip")}
      </button>

      <p className="cinema-splash-note">{t("demoNote")}</p>
    </section>
  );
}
