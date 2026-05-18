"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/i18n/routing";

const SystemVisualizer = dynamic(
  () =>
    import("@/components/home/SystemVisualizer").then((m) => m.SystemVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[380px] animate-pulse rounded-2xl border border-white/10 bg-surface/30" />
    ),
  },
);

type Props = {
  locale: Locale;
};

export function SystemVisualizerSection({ locale }: Props) {
  return <SystemVisualizer locale={locale} />;
}
