"use client";

import { useEffect, useState } from "react";

export function FloatingWidgets() {
  const [clock, setClock] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("ar-SY", { weekday: "long", day: "numeric", month: "long" }));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="cinema-os-float cinema-os-float--clock">
        <strong>{clock}</strong>
        <span>{date}</span>
      </div>
      <div className="cinema-os-float cinema-os-float--status">
        <span className="cinema-os-live-dot" aria-hidden />
        النظام يعمل بكفاءة 99.9%
      </div>
      <div className="cinema-os-float cinema-os-float--weather">
        دمشق · 28° · 🌙
      </div>
    </>
  );
}
