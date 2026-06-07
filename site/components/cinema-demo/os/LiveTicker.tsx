"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function LiveTicker() {
  const t = useTranslations("CinemaDemo");
  const liveRevenue = useCinemaDemoStore((s) => s.liveRevenue);
  const [lastBookingSec, setLastBookingSec] = useState(23);
  const [occ1, setOcc1] = useState(78);
  const [occ2, setOcc2] = useState(89);
  const [occ3, setOcc3] = useState(67);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLastBookingSec((s) => (s >= 120 ? 12 + Math.floor(Math.random() * 30) : s + 3));
      setOcc1((v) => Math.min(98, Math.max(60, v + (Math.random() > 0.5 ? 1 : -1))));
      setOcc2((v) => Math.min(98, Math.max(50, v + (Math.random() > 0.5 ? 1 : -1))));
      setOcc3((v) => Math.min(95, Math.max(55, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const revenue = mounted ? liveRevenue.toLocaleString("ar-SY") : "2,847,500";
  const text = t("os.tickerLine", {
    occ1: mounted ? occ1 : 78,
    occ2: mounted ? occ2 : 89,
    occ3: mounted ? occ3 : 67,
    revenue,
    currency: t("currency"),
    sec: mounted ? lastBookingSec : 23,
    weather: t("os.tickerWeatherDetail"),
  });

  return (
    <div className="cinema-os-ticker" aria-live="polite" suppressHydrationWarning>
      <div className="cinema-os-ticker-track">
        <span>{text}</span>
        <span aria-hidden>{text}</span>
      </div>
    </div>
  );
}
