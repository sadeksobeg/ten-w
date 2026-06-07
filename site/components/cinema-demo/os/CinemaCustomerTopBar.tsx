"use client";

import { useTranslations } from "next-intl";
import { CinemaBrandLogo } from "@/components/cinema-demo/CinemaBrandLogo";

export function CinemaCustomerTopBar() {
  const t = useTranslations("CinemaDemo");

  return (
    <header className="cinema-customer-topbar">
      <CinemaBrandLogo variant="compact" className="cinema-customer-topbar-brand" />
      <span className="cinema-customer-topbar-badge">{t("demoBadge")}</span>
    </header>
  );
}
