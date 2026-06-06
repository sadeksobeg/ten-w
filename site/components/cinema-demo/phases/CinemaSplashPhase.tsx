"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";
import { CINEMA_BRAND } from "@/lib/cinema-demo/data";

export function CinemaSplashPhase() {
  const t = useTranslations("CinemaDemo");
  const setPhase = useCinemaDemoStore((s) => s.setPhase);

  return (
    <section className="cinema-splash cinema-phase">
      <Image
        src={CINEMA_BRAND.logoSrc}
        alt={t("brandName")}
        width={640}
        height={640}
        className="cinema-splash-logo"
        priority
      />
      <p className="cinema-splash-tag">{t("splash.tag")}</p>
      <button type="button" className="cinema-splash-cta" onClick={() => setPhase("movies")}>
        {t("splash.cta")}
      </button>
      <p className="cinema-demo-note" style={{ color: "rgba(0,0,0,0.45)" }}>
        {t("demoNote")}
      </p>
    </section>
  );
}
