"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  /** Load slightly before the block enters the viewport */
  rootMargin?: string;
  minHeight?: number | string;
  className?: string;
};

/**
 * Mounts children only when near the viewport — keeps heavy JS off the initial load.
 */
export function LazyWhenVisible({
  children,
  fallback = null,
  rootMargin = "280px 0px",
  minHeight,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className} style={minHeight != null ? { minHeight } : undefined}>
      {visible ? children : fallback}
    </div>
  );
}
