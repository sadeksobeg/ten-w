"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { usePrefersReducedMotion } from "@/components/invite/hooks/usePrefersReducedMotion";

export type BootStage =
  | "black"
  | "point"
  | "lines"
  | "logo"
  | "subtitle"
  | "particles"
  | "curtain"
  | "done";

type Props = {
  alreadyAccepted: boolean;
  onComplete: () => void;
  onCanvasVisible?: () => void;
};

const LOGO_TEXT = "TENEGTA";

const TIMING_NORMAL: Record<BootStage, number> = {
  black: 400,
  point: 400,
  lines: 600,
  logo: 800,
  subtitle: 600,
  particles: 400,
  curtain: 600,
  done: 400,
};

const TIMING_COMPRESSED: Record<BootStage, number> = {
  black: 120,
  point: 120,
  lines: 150,
  logo: 200,
  subtitle: 180,
  particles: 150,
  curtain: 180,
  done: 150,
};

const STAGES: BootStage[] = [
  "black",
  "point",
  "lines",
  "logo",
  "subtitle",
  "particles",
  "curtain",
  "done",
];

export function BootPhase({ alreadyAccepted, onComplete, onCanvasVisible }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<BootStage>("black");
  const [exiting, setExiting] = useState(false);
  const [logoShimmer, setLogoShimmer] = useState(false);
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
      if (next === "particles") onCanvasVisible?.();
      if (next === "logo") {
        const shimmerDelay = accelerated.current ? 400 : 1030;
        setTimeout(() => setLogoShimmer(true), shimmerDelay);
      }
      if (next === "done") {
        setExiting(true);
        timer = setTimeout(onComplete, timing.done);
        return;
      }
      idx += 1;
      const delay = accelerated.current ? timing[next] * 0.45 : timing[next];
      timer = setTimeout(advance, delay);
    };

    timer = setTimeout(advance, timing.black);
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

  const showPoint = stage !== "black";
  const showLines = ["lines", "logo", "subtitle", "particles", "curtain", "done"].includes(stage);
  const showLogo = ["logo", "subtitle", "particles", "curtain", "done"].includes(stage);
  const showSubtitle = ["subtitle", "particles", "curtain", "done"].includes(stage);
  const showCurtain = ["curtain", "done"].includes(stage);

  const subtitle = alreadyAccepted ? "مرحباً بعودتك" : "لديك دعوة خاصة";

  return (
    <div
      className={`invite-boot-overlay invite-phase-fade ${exiting ? "invite-phase-hidden" : "invite-phase-visible"}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {showPoint ? (
        <div
          className="invite-boot-point"
          style={{
            transform: stage === "point" || showLines ? "scale(1)" : "scale(0)",
          }}
        />
      ) : null}

      {showLines ? (
        <div
          className="invite-boot-line-center my-6"
          style={{ width: showLogo ? 160 : 0 }}
        />
      ) : null}

      {showLogo ? (
        <p
          className={`invite-boot-logo invite-boot-logo--word ${logoShimmer ? "invite-text-shimmer" : ""}`}
        >
          {LOGO_TEXT}
        </p>
      ) : null}

      {showSubtitle ? (
        <p className="invite-font-arabic mt-8 text-center text-lg font-semibold text-[var(--text-sub)] sm:text-xl">
          {subtitle}
        </p>
      ) : null}

      {showCurtain ? (
        <>
          <div
            className="invite-boot-curtain-bar invite-boot-curtain-bar--top"
            style={{ height: exiting ? 0 : "50vh" }}
          />
          <div
            className="invite-boot-curtain-bar invite-boot-curtain-bar--bottom"
            style={{ height: exiting ? 0 : "50vh" }}
          />
        </>
      ) : null}
    </div>
  );
}
