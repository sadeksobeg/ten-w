"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const STORAGE_KEY = "tenegta-sound";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  playHover: () => void;
  playClick: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

function useOptionalAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const beep = useCallback((freq: number, duration: number) => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!ctxRef.current) ctxRef.current = new Ctx();
      const actx = ctxRef.current;
      if (actx.state === "suspended") void actx.resume();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(actx.destination);
      const t = actx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch {
      /* ignore */
    }
  }, []);

  return { beep };
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const { beep } = useOptionalAudio();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setEnabled(localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        setEnabled(false);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const playHover = useCallback(() => {
    if (!enabled || reduced) return;
    beep(880, 0.06);
  }, [beep, enabled, reduced]);

  const playClick = useCallback(() => {
    if (!enabled || reduced) return;
    beep(1320, 0.08);
  }, [beep, enabled, reduced]);

  const value = useMemo(
    () => ({ enabled, toggle, playHover, playClick }),
    [enabled, toggle, playHover, playClick],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      enabled: false,
      toggle: () => {},
      playHover: () => {},
      playClick: () => {},
    };
  }
  return ctx;
}
