"use client";

import { LazyWhenVisible } from "@/components/ui/LazyWhenVisible";
import type { ReactNode } from "react";

type Props = {
  testimonial: ReactNode;
  thoughtLeadership: ReactNode;
  services: ReactNode;
  valueStrip: ReactNode;
  projects: ReactNode;
  visualizer: ReactNode;
  contact: ReactNode;
};

function BlockFallback({ className }: { className: string }) {
  return <div className={className} aria-hidden />;
}

/** Below-the-fold homepage blocks — JS loads when user scrolls near them. */
export function HomeLazySections({
  testimonial,
  thoughtLeadership,
  services,
  valueStrip,
  projects,
  visualizer,
  contact,
}: Props) {
  return (
    <>
      <LazyWhenVisible
        minHeight={120}
        fallback={<BlockFallback className="min-h-[120px]" />}
      >
        {testimonial}
      </LazyWhenVisible>

      <LazyWhenVisible
        minHeight={100}
        fallback={<BlockFallback className="min-h-[100px]" />}
      >
        {thoughtLeadership}
      </LazyWhenVisible>

      <LazyWhenVisible
        minHeight={320}
        fallback={<BlockFallback className="min-h-[320px]" />}
      >
        {services}
      </LazyWhenVisible>

      <LazyWhenVisible
        minHeight={80}
        fallback={<BlockFallback className="min-h-[80px]" />}
      >
        {valueStrip}
      </LazyWhenVisible>

      <LazyWhenVisible
        minHeight={280}
        fallback={<BlockFallback className="min-h-[280px]" />}
      >
        {projects}
      </LazyWhenVisible>

      <LazyWhenVisible
        minHeight={560}
        fallback={<BlockFallback className="min-h-[560px] rounded-2xl" />}
      >
        {visualizer}
      </LazyWhenVisible>

      <LazyWhenVisible
        minHeight={200}
        fallback={<BlockFallback className="min-h-[200px]" />}
      >
        {contact}
      </LazyWhenVisible>
    </>
  );
}
