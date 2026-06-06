"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function IncidentPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissed) markFeatureSeen(17);
  }, [dismissed, markFeatureSeen]);

  if (dismissed) return null;

  return (
    <div className="cinema-os-panel cinema-os-panel--alert">
      <h4>{t("os.incidentTitle")}</h4>
      <p>بلاغ: مقعد C7 — مكسور</p>
      <button type="button" className="cinema-hud-btn" onClick={() => setDismissed(true)}>
        {t("os.incidentAction")}
      </button>
    </div>
  );
}
