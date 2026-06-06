"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CompetitorPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);

  useEffect(() => {
    markFeatureSeen(13);
  }, [markFeatureSeen]);

  return (
    <div className="cinema-os-panel">
      <h4>{t("os.marketTitle")}</h4>
      <p>A: 12,000 · B: 14,000</p>
      <p>{t("os.marketShare")}</p>
    </div>
  );
}
