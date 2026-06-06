"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  BOOKING_MOVIES,
  BOOKING_NAMES,
  INITIAL_BOOKINGS,
  type BookingFeedItem,
} from "@/lib/cinema-demo/manager-data";

export function BookingsFeed() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [items, setItems] = useState<BookingFeedItem[]>(INITIAL_BOOKINGS);

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
      setItems((prev) => [newItem, ...prev].slice(0, 8));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mgr-feed">
      {items.map((item) => (
        <div key={item.id} className="mgr-feed-row mgr-feed-row--new">
          <span className="mgr-feed-name">{item.name}</span>
          <span className="mgr-feed-detail">
            {item.tickets}× {isAr ? item.movieAr : item.movieEn}
          </span>
          <span className="mgr-feed-meta">
            {isAr ? item.hallAr : item.hallEn} · {item.time}
          </span>
          <span className="mgr-feed-amount">{item.amount.toLocaleString("ar-SY")}</span>
        </div>
      ))}
    </div>
  );
}
