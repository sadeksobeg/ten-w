"use client";

import {
  useEffect,
  useState,
  type RefObject,
} from "react";

export function useCanvasSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 800, h: 520 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const w = Math.max(320, Math.floor(r.width));
      const h = Math.max(380, Math.floor(r.height));
      setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}
