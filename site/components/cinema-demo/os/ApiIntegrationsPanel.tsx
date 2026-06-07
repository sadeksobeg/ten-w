"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

const INTEGRATION_KEYS = [
  "integrationWhatsapp",
  "integrationPayment",
  "integrationEmail",
  "integrationAnalytics",
  "integrationAccounting",
] as const;

export function ApiIntegrationsPanel() {
  const t = useTranslations("CinemaDemo");
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);

  useEffect(() => {
    markFeatureSeen(19);
    markFeatureSeen(5);
    markFeatureSeen(6);
    markFeatureSeen(20);
  }, [markFeatureSeen]);

  return (
    <div className="cinema-os-panel">
      <h4>{t("os.integrationsTitle")}</h4>
      <ul className="cinema-os-integrations">
        {INTEGRATION_KEYS.map((key) => (
          <li key={key}>✓ {t(`os.${key}`)}</li>
        ))}
      </ul>
    </div>
  );
}
