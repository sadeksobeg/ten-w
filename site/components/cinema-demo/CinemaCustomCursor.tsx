"use client";

import { useEffect, useState } from "react";

export function CinemaCustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="cinema-custom-cursor cinema-custom-cursor--manager"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden
    >
      <span className="cinema-custom-cursor-dot" />
      <span className="cinema-custom-cursor-crosshair" />
    </div>
  );
}
