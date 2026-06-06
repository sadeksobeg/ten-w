"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

export type BootStage =
  | "dark"
  | "point"
  | "line"
  | "logo"
  | "text"
  | "curtain"
  | "done";

type Props = {
  alreadyAccepted: boolean;
  onComplete: () => void;
  onCanvasVisible?: () => void;
};

const LOGO = "TENEGTA";

const TIMING_NORMAL: Record<BootStage, number> = {
  dark: 300,
  point: 500,
  line: 700,
  logo: 700,
  text: 800,
  curtain: 500,
  done: 500,
};

const TIMING_COMPRESSED: Record<BootStage, number> = {
  dark: 100,
  point: 150,
  line: 150,
  logo: 200,
  text: 250,
  curtain: 200,
  done: 150,
};

const STAGES: BootStage[] = ["dark", "point", "line", "logo", "text", "curtain", "done"];

export function BootPhase({ alreadyAccepted, onComplete, onCanvasVisible }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<BootStage>("dark");
  const [exiting, setExiting] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const accelerated = useRef(false);
  const timing = reducedMotion ? TIMING_COMPRESSED : TIMING_NORMAL;

  useEffect(() => {
    let idx = 1;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      if (idx >= STAGES.length) return;
      const next = STAGES[idx];
      setStage(next);
      if (next === "text") onCanvasVisible?.();
      if (next === "done") {
        setExiting(true);
        timer = setTimeout(onComplete, timing.done);
        return;
      }
      idx += 1;
      const delay = accelerated.current ? timing[next] * 0.45 : timing[next];
      timer = setTimeout(advance, delay);
    };

    timer = setTimeout(advance, timing.dark);
    return () => clearTimeout(timer);
  }, [onComplete, onCanvasVisible, timing]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartY.current;
    const end = e.changedTouches[0]?.clientY;
    if (start != null && end != null && start - end > 40) {
      accelerated.current = true;
    }
  };

  const showPoint = stage !== "dark";
  const showLine = ["line", "logo", "text", "curtain", "done"].includes(stage);
  const showLogo = ["logo", "text", "curtain", "done"].includes(stage);
  const showText = ["text", "curtain", "done"].includes(stage);
  const showCurtain = ["curtain", "done"].includes(stage);

  const subtitle = alreadyAccepted ? "مرحباً بعودتك" : "لديك دعوة خاصة";
  const hint = alreadyAccepted
    ? "جاري فتح تجربتك…"
    : "دعوة حصرية لصانع محتوى — مُعدّة بعناية لك وحدك";

  return (
    <div
      className={`invite-phase-fade fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-[var(--void)] ${exiting ? "invite-phase-hidden" : "invite-phase-visible"}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {showPoint ? (
        <div
          className="invite-boot-point mb-8 transition-transform duration-700"
          style={{ transform: showLine ? "scale(1)" : "scale(0)" }}
        />
      ) : null}

      {showLine ? (
        <div className="mb-6 flex flex-col items-center gap-3">
          <div
            className="invite-boot-gate-line h-px transition-all duration-700"
            style={{ width: showLogo ? 120 : 0 }}
          />
          <div
            className="invite-boot-gate-line h-px transition-all duration-700 delay-100"
            style={{ width: showLogo ? 120 : 0 }}
          />
        </div>
      ) : null}

      {showLogo ? (
        <div className="text-center">
          <p
            className="invite-font-display invite-text-shimmer text-[28px] tracking-[0.35em] text-white"
            aria-hidden
          >
            {LOGO.split("").map((letter, i) => (
              <span
                key={letter + i}
                className="invite-letter"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {letter}
              </span>
            ))}
          </p>
          <div
            className="invite-boot-wings mx-auto mt-4 transition-all duration-700"
            style={{ width: showText ? 160 : 0 }}
          />
        </div>
      ) : null}

      {showText ? (
        <div className="mt-10 text-center">
          <p className="invite-font-arabic text-lg font-semibold text-[var(--text-sub)] sm:text-xl">
            {subtitle.split("").map((char, i) => (
              <span
                key={`${char}-${i}`}
                className="invite-letter"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </p>
          <p className="invite-reveal-up mt-3 text-sm text-white/45" style={{ animationDelay: "400ms" }}>
            {hint}
          </p>
        </div>
      ) : null}

      {showCurtain ? (
        <>
          <div
            className="invite-boot-curtain-bar fixed inset-x-0 top-0 z-[61]"
            style={{ height: exiting ? 0 : "50vh" }}
          />
          <div
            className="invite-boot-curtain-bar fixed inset-x-0 bottom-0 z-[61]"
            style={{ height: exiting ? 0 : "50vh" }}
          />
        </>
      ) : null}
    </div>
  );
}
