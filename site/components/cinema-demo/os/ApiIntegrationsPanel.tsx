"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

const INTEGRATIONS = [
  "WhatsApp Business",
  "بوابة الدفع",
  "حساب البريد",
  "Google Analytics",
  "نظام المحاسبة",
];

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
        {INTEGRATIONS.map((name) => (
          <li key={name}>✓ {name}</li>
        ))}
      </ul>
    </div>
  );
}
