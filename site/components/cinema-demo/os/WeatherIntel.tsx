"use client";

import { useTranslations } from "next-intl";

export function WeatherIntel() {
  const t = useTranslations("CinemaDemo");
  return (
    <div className="cinema-os-weather">
      <span className="cinema-os-weather-icon" aria-hidden>⛅</span>
      <p>{t("os.weatherSummary")}</p>
      <p>{t("os.crowdForecast")}</p>
      <p className="cinema-os-weather-tip">{t("os.cashierTip")}</p>
    </div>
  );
}
