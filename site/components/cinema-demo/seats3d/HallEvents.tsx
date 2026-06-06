"use client";

import { useEffect } from "react";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function useHallEvents(active: boolean) {
  const setScreenMode = useCinemaDemoStore((s) => s.setScreenMode);
  const pushBookingFeed = useCinemaDemoStore((s) => s.pushBookingFeed);

  useEffect(() => {
    if (!active) return;
    const events = [
      () => pushBookingFeed({
        id: `evt-${Date.now()}`,
        name: "مشتري",
        tickets: 1,
        movieAr: "كثيب",
        movieEn: "Dune",
        hallAr: "قاعة 1",
        hallEn: "Hall 1",
        time: "19:30",
        amount: 15000,
      }),
      () => setScreenMode("playing"),
      () => setScreenMode("preMovie"),
    ];
    const id = window.setInterval(() => {
      events[Math.floor(Math.random() * events.length)]();
    }, 30000);
    return () => clearInterval(id);
  }, [active, pushBookingFeed, setScreenMode]);
}
