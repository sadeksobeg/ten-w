"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Base path without extension, e.g. /videos/for-creators/cinema-film */
  srcBase: string;
  poster?: string;
  className?: string;
  /** CSS gradient fallback when video assets are absent */
  gradientClass?: string;
  overlayClassName?: string;
  /** Hero — start loading immediately */
  priority?: boolean;
  /** Wait until near viewport before mounting video (default: true when not priority) */
  lazy?: boolean;
  /** Remount video when value changes (cinema scene switches) */
  reloadKey?: string;
  /** When false, only gradient is shown (e.g. decorative desktop-only layer) */
  enabled?: boolean;
};

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reducedMotion;
}

function useNearViewport(enabled: boolean, rootMargin = "280px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setNear(false);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return { ref, near };
}

function useMobileVideo() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return mobile;
}

export function CinematicVideoLayer({
  srcBase,
  poster,
  className = "",
  gradientClass = "fc-cinema-gradient--film",
  overlayClassName = "",
  priority = false,
  lazy,
  reloadKey,
  enabled = true,
}: Props) {
  const shouldLazy = lazy ?? !priority;
  const reducedMotion = useReducedMotion();
  const { ref, near } = useNearViewport(shouldLazy && enabled);
  const isMobile = useMobileVideo();
  const [ready, setReady] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);

  const inView = priority || near;
  const showVideo = enabled && inView && !reducedMotion;

  useEffect(() => {
    if (!showVideo) {
      setReady(false);
      setVideoVisible(false);
      return;
    }
    if (priority) {
      setReady(true);
      return;
    }
    const id = window.requestIdleCallback?.(() => setReady(true)) ?? window.setTimeout(() => setReady(true), 80);
    return () => {
      if (typeof id === "number") window.clearTimeout(id);
    };
  }, [showVideo, priority]);

  const videoSrc = isMobile ? `${srcBase}-mobile.mp4` : `${srcBase}.mp4`;
  const videoKey = `${reloadKey ?? srcBase}-${isMobile ? "m" : "d"}`;

  return (
    <div
      ref={ref}
      className={`fc-cinema-video-layer absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className={`fc-cinema-gradient absolute inset-0 ${gradientClass}`} />
      {showVideo && ready ? (
        <video
          key={videoKey}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${videoVisible ? "opacity-70" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          poster={poster}
          onCanPlay={() => setVideoVisible(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
      <div className={`fc-cinema-video-vignette absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}
