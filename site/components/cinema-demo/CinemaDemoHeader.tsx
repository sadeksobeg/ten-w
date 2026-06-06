"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CINEMA_BRAND } from "@/lib/cinema-demo/data";

export function CinemaDemoHeader() {
  const t = useTranslations("CinemaDemo");

  return (
    <header className="cinema-header">
      <Image
        src={CINEMA_BRAND.logoSrc}
        alt={t("brandName")}
        width={120}
        height={40}
        className="cinema-header-logo"
      />
      <span className="cinema-header-badge">{t("demoBadge")}</span>
    </header>
  );
}
