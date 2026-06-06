"use client";

import { useScrollProgress } from "@/components/invite/hooks/useScrollProgress";

type Props = {
  enabled?: boolean;
};

export function ScrollProgressBar({ enabled = true }: Props) {
  const progress = useScrollProgress(enabled);

  if (!enabled) return null;

  return (
    <div
      className="invite-scroll-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden
    />
  );
}
