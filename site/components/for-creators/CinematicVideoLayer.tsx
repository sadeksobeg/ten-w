"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Base path without extension, e.g. /videos/for-creators/cinema-film */
  srcBase: string;
  poster?: string;
  className?: string;
  /** CSS gradient fallback when video assets are absent */
  gradientClass?: string;
  overlayClassName?: string;
};

export function CinematicVideoLayer({
  srcBase,
  poster,
  className = "",
  gradientClass = "fc-cinema-gradient--film",
  overlayClassName = "",
}: Props) {
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);

    if (mq.matches) return () => mq.removeEventListener("change", onChange);

    const id = window.requestIdleCallback?.(() => setCanPlayVideo(true)) ?? window.setTimeout(() => setCanPlayVideo(true), 120);
    return () => {
      mq.removeEventListener("change", onChange);
      if (typeof id === "number") window.clearTimeout(id);
    };
  }, []);

  const showVideo = canPlayVideo && !reducedMotion;

  return (
    <div className={`fc-cinema-video-layer absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className={`fc-cinema-gradient absolute inset-0 ${gradientClass}`} />
      {showVideo ? (
        <video
          className="absolute inset-0 size-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={`${srcBase}.webm`} type="video/webm" />
          <source src={`${srcBase}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      <div className={`fc-cinema-video-vignette absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
