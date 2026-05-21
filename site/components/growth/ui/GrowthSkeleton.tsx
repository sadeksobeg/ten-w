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
