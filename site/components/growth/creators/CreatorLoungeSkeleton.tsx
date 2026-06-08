"use client";

import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GrowthSkeleton, SkeletonHero, SkeletonStatGrid } from "@/components/growth/ui/GrowthSkeleton";

export function CreatorLoungeSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading creator lounge">
      <SkeletonHero />
      <SkeletonStatGrid count={3} />
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]">
        <GlassCard className="hidden border border-white/10 p-4 lg:block">
          <GrowthSkeleton lines={7} />
        </GlassCard>
        <div className="space-y-4">
          <GlassCard className="border border-white/10 p-5">
            <GrowthSkeleton className="h-32 w-full" />
          </GlassCard>
          <GlassCard className="border border-white/10 p-5">
            <GrowthSkeleton className="h-48 w-full" />
          </GlassCard>
        </div>
        <GlassCard className="hidden border border-white/10 p-4 lg:block">
          <GrowthSkeleton lines={5} />
        </GlassCard>
      </div>
    </div>
  );
}

export function CreatorLoungeSectionSkeleton() {
  return (
    <GlassCard className="border border-white/10 p-5">
      <GrowthSkeleton className="mb-4 h-6 w-1/3" />
      <GrowthSkeleton lines={4} />
    </GlassCard>
  );
}
