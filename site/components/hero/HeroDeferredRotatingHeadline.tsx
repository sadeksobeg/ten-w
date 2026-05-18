"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroRotatingHeadline = dynamic(
  () =>
    import("@/components/hero/HeroRotatingHeadline").then((m) => ({
      default: m.HeroRotatingHeadline,
    })),
  { ssr: false },
);

type Props = { fallbackLine: string };

/** Defers framer-motion headline until after first paint (improves LCP on h1). */
export function HeroDeferredRotatingHeadline({ fallbackLine }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 800);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <p
        className="mt-4 min-h-[3.25rem] max-w-xl text-base font-medium leading-snug text-gold md:min-h-[3.5rem] md:text-lg"
        aria-hidden
      >
        {fallbackLine}
      </p>
    );
  }

  return <HeroRotatingHeadline />;
}
