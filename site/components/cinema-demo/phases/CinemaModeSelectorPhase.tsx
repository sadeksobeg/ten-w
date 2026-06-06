"use client";

import { useTranslations } from "next-intl";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { CinemaIcon } from "@/components/cinema-demo/CinemaIcon";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaModeSelectorPhase() {
  const t = useTranslations("CinemaDemo");
  const setDemoMode = useCinemaDemoStore((s) => s.setDemoMode);
  const setPhase = useCinemaDemoStore((s) => s.setPhase);

  const modes = [
    {
      id: "customer" as const,
      icon: "film" as const,
      title: t("modes.customer.title"),
      desc: t("modes.customer.desc"),
      phase: "movies" as const,
    },
    {
      id: "manager" as const,
      icon: "chart" as const,
      title: t("modes.manager.title"),
      desc: t("modes.manager.desc"),
      phase: "manager" as const,
    },
    {
      id: "vip" as const,
      icon: "crown" as const,
      title: t("modes.vip.title"),
      desc: t("modes.vip.desc"),
      phase: "vip" as const,
    },
  ];

  return (
    <section className="cinema-phase cinema-mode-select">
      <div className="cinema-container cinema-mode-select-inner">
        <CinemaBrandLogo variant="dark" className="mx-auto mb-6" />
        <h1 className="cinema-title text-center">{t("modes.title")}</h1>
        <p className="cinema-subtitle text-center mb-8">{t("modes.subtitle")}</p>

        <div className="cinema-mode-grid">
          {modes.map((mode, i) => (
            <button
              key={mode.id}
              type="button"
              className={`cinema-mode-card cinema-reveal cinema-reveal--delay-${i + 1}`}
              onClick={() => {
                setDemoMode(mode.id);
                setPhase(mode.phase);
              }}
            >
              <span className="cinema-mode-icon-wrap">
                <CinemaIcon name={mode.icon} size={28} />
              </span>
              <span className="cinema-mode-title">{mode.title}</span>
              <span className="cinema-mode-desc">{mode.desc}</span>
              <span className="cinema-mode-cta">
                {t("modes.start")}
                <CinemaIcon name="arrow" size={14} className="cinema-mode-arrow" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
