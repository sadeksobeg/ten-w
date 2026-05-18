"use client";

import dynamic from "next/dynamic";

const TurnstileField = dynamic(
  () =>
    import("@/components/contact/TurnstileField").then((m) => ({
      default: m.TurnstileField,
    })),
  { ssr: false, loading: () => <div className="h-[65px]" aria-hidden /> },
);

export { TurnstileField as LazyTurnstileField };
