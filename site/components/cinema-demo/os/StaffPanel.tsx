"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function StaffPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);

  useEffect(() => {
    markFeatureSeen(8);
  }, [markFeatureSeen]);

  return (
    <div className="cinema-os-panel">
      <h4>{t("os.staffTitle")}</h4>
      <p>3 {t("os.staffBox")}</p>
      <p>{t("os.staffShift")}</p>
    </div>
  );
}
