"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BOOKING_MOVIES,
  BOOKING_NAMES,
  INITIAL_BOOKINGS,
  type BookingFeedItem,
} from "@/lib/cinema-demo/manager-data";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function BookingFeedLive() {
  const t = useTranslations("CinemaDemo");
  const locale = useLocale();
  const isAr = locale === "ar";
  const storeFeed = useCinemaDemoStore((s) => s.bookingFeed);
  const [items, setItems] = useState<BookingFeedItem[]>(INITIAL_BOOKINGS);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const pulseTimer = useRef<number | null>(null);

  useEffect(() => {
    if (storeFeed.length > 0) {
      setItems((prev) => {
        const merged = [...storeFeed, ...prev];
        const seen = new Set<string>();
        return merged.filter((x) => {
          if (seen.has(x.id)) return false;
          seen.add(x.id);
          return true;
        }).slice(0, 10);
      });
      setPulseId(storeFeed[0]?.id ?? null);
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
      pulseTimer.current = window.setTimeout(() => setPulseId(null), 1200);
    }
  }, [storeFeed]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const movie = BOOKING_MOVIES[Math.floor(Math.random() * BOOKING_MOVIES.length)];
      const name = BOOKING_NAMES[Math.floor(Math.random() * BOOKING_NAMES.length)];
      const tickets = 1 + Math.floor(Math.random() * 4);
      const newItem: BookingFeedItem = {
        id: `b-${Date.now()}`,
        name,
        tickets,
        movieAr: movie.ar,
        movieEn: movie.en,
        hallAr: movie.hallAr,
        hallEn: movie.hallEn,
        time: `${19 + Math.floor(Math.random() * 3)}:${Math.random() > 0.5 ? "30" : "00"}`,
        amount: tickets * 15000,
      };
      setItems((prev) => [newItem, ...prev].slice(0, 10));
      setPulseId(newItem.id);
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
      pulseTimer.current = window.setTimeout(() => setPulseId(null), 1200);
    }, 5000);
    return () => {
      clearInterval(id);
      if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    };
  }, []);

  return (
    <div className="cinema-os-feed">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`cinema-os-feed-row ${pulseId === item.id ? "is-new" : ""}`}
        >
          <span>{i === 0 ? t("os.feedJustNow") : t("os.feedAgo", { sec: i * 23 })}</span>
          <span>
            {t("os.feedRow", {
              name: item.name,
              tickets: item.tickets,
              hall: isAr ? item.hallAr : item.hallEn,
            })}
          </span>
          <span className="cinema-os-feed-amount">
            {item.amount.toLocaleString("ar-SY")} {t("currency")}
          </span>
        </div>
      ))}
    </div>
  );
}
