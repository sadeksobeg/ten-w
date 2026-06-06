"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function ReportsPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);

  useEffect(() => {
    markFeatureSeen(18);
  }, [markFeatureSeen]);

  return (
    <div className="cinema-os-panel">
      <h4>{t("os.reportsTitle")}</h4>
      <p>{t("os.reportMonth")}</p>
      <p>{t("os.profitMargin")}</p>
      <button type="button" className="cinema-hud-btn">{t("os.downloadReport")}</button>
    </div>
  );
}
