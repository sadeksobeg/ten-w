"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function AnalyticsPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);

  useEffect(() => {
    markFeatureSeen(12);
  }, [markFeatureSeen]);

  return (
    <div className="cinema-os-panel">
      <h4>{t("os.analyticsTitle")}</h4>
      <div className="cinema-os-mini-chart">
        <span style={{ width: "40%" }}>18-25</span>
        <span style={{ width: "35%" }}>26-35</span>
        <span style={{ width: "25%" }}>36+</span>
      </div>
      <p>{t("os.avgCustomer")}</p>
    </div>
  );
}
