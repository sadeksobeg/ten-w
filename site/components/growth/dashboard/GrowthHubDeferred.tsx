"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SkeletonStatGrid } from "@/components/growth/ui/GrowthSkeleton";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

/** Defers below-the-fold Hub sections so hero/check-in paint first. */
export function GrowthHubDeferred({ children, fallback }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!ready) {
    return <>{fallback ?? <SkeletonStatGrid count={2} />}</>;
  }
  return <>{children}</>;
}
