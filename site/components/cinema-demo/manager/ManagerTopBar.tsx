"use client";

import { useLocale, useTranslations } from "next-intl";

export function ManagerTopBar() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const today = new Date().toLocaleDateString(locale === "ar" ? "ar-SY" : locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mgr-topbar">
      <div>
        <p className="mgr-topbar-date">{today}</p>
        <h2 className="cinema-title" style={{ marginBottom: 0 }}>
          {t("manager.title")}
        </h2>
      </div>
      <div className="mgr-topbar-filters">
        <span className="mgr-pill mgr-pill--active">{t("manager.filterToday")}</span>
        <span className="mgr-pill">{t("manager.filterWeek")}</span>
      </div>
    </div>
  );
}
