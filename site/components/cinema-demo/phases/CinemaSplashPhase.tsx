"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CINEMA_BRAND } from "@/lib/cinema-demo/data";

export function CinemaSplashPhase() {
  const t = useTranslations("CinemaDemo");
  const setPhase = useCinemaDemoStore((s) => s.setPhase);
  const [boot, setBoot] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setBoot(1), 400),
      window.setTimeout(() => setBoot(2), 1100),
      window.setTimeout(() => setBoot(3), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className={`cinema-splash cinema-phase cinema-splash--boot-${boot}`}>
      <div className="cinema-splash-scanline" aria-hidden />
      <div className="cinema-splash-vignette" aria-hidden />

      <div className="cinema-splash-logo-wrap">
        <Image
          src={CINEMA_BRAND.logoMarkSrc}
          alt={t("brandName")}
          width={480}
          height={200}
          className="cinema-splash-mark"
          priority
        />
      </div>

      <p className="cinema-splash-tag">{t("splash.tag")}</p>
      <p className="cinema-splash-system">{t("splash.systemLine")}</p>

      <button
        type="button"
        className="cinema-splash-cta"
        onClick={() => setPhase("movies")}
      >
        <span>{t("splash.cta")}</span>
      </button>

      <div className="cinema-splash-loader" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <p className="cinema-splash-note">{t("demoNote")}</p>
    </section>
  );
}
