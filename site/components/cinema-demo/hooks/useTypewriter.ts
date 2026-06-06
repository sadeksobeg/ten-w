"use client";

import { useEffect, useState } from "react";

export function useTypewriter(lines: string[], msPerLine = 120, enabled = true) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setVisibleCount(lines.length);
      return;
    }
    setVisibleCount(0);
    let line = 0;
    const id = window.setInterval(() => {
      line += 1;
      setVisibleCount(line);
      if (line >= lines.length) clearInterval(id);
    }, msPerLine);
    return () => clearInterval(id);
  }, [lines, msPerLine, enabled]);

  useEffect(() => {
    if (!enabled || visibleCount < lines.length) return;
    let blinks = 0;
    const id = window.setInterval(() => {
      blinks += 1;
      setCursorVisible((v) => !v);
      if (blinks >= 6) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, [visibleCount, lines.length, enabled]);

  return {
    visibleLines: lines.slice(0, enabled ? visibleCount : lines.length),
    done: visibleCount >= lines.length,
    cursorVisible,
  };
}
