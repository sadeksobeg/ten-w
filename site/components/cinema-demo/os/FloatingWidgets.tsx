"use client";

import { useTranslations } from "next-intl";

export function FloatingWidgets() {
  const t = useTranslations("CinemaDemo");

  return (
    <div className="cinema-os-float cinema-os-float--status" aria-live="polite">
      <span className="cinema-os-live-dot" aria-hidden />
      {t("os.systemStatus")}
    </div>
  );
}
