type Props = {
  className?: string;
  lines?: number;
};

export function GrowthSkeleton({ className = "h-24 w-full", lines }: Props) {
  if (lines && lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`growth-skeleton-pulse rounded-xl bg-white/10 ${i === 0 ? "h-8 w-1/3" : "h-16 w-full"}`}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`growth-skeleton-pulse rounded-xl bg-white/10 ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonHero() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="growth-skeleton-pulse mx-auto h-28 w-28 shrink-0 rounded-full bg-white/10 sm:mx-0" />
      <div className="flex-1 space-y-3">
        <div className="growth-skeleton-pulse mx-auto h-7 w-48 rounded-lg bg-white/10 sm:mx-0" />
        <div className="growth-skeleton-pulse mx-auto h-4 w-32 rounded bg-white/10 sm:mx-0" />
        <div className="growth-skeleton-pulse h-3 w-full max-w-md rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="growth-skeleton-pulse h-20 rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}

export function SkeletonDealRow({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="growth-skeleton-pulse h-14 rounded-xl bg-white/10" />
      ))}
    </div>
  );
}
