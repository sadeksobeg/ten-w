"use client";

import { useEffect, useState } from "react";
import type { DemoMode } from "@/stores/cinema-demo-store";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

export function CinemaCustomCursor() {
  const demoMode = useCinemaDemoStore((s) => s.demoMode);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [coarse, setCoarse] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (coarse) return;
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [coarse]);

  if (coarse || !visible) return null;

  const modeClass =
    demoMode === "manager" ? "cinema-cursor--manager" : demoMode === "vip" ? "cinema-cursor--vip" : "";

  return (
    <div
      className={`cinema-custom-cursor ${modeClass}`}
      style={{ transform: `translate(calc(${pos.x}px - 50%), calc(${pos.y}px - 50%))` }}
      aria-hidden
    >
      <span className="cinema-custom-cursor-dot" />
      {demoMode === "manager" ? <span className="cinema-custom-cursor-crosshair" /> : null}
    </div>
  );
}
