"use client";

import { useTranslations } from "next-intl";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";
import { CinemaProgressBar } from "@/components/cinema-demo/CinemaProgressBar";
import { CinemaSoundToggle } from "@/components/cinema-demo/CinemaSoundToggle";

export function CinemaDemoHeader() {
  const t = useTranslations("CinemaDemo");

  return (
    <>
      <CinemaProgressBar />
      <header className="cinema-header">
        <CinemaBrandLogo variant="compact" alt={t("brandName")} />
        <div className="cinema-header-actions">
          <CinemaSoundToggle />
          <span className="cinema-header-badge">{t("demoBadge")}</span>
        </div>
      </header>
    </>
  );
}
