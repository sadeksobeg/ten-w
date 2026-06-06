"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { getFeature } from "@/lib/cinema-demo/features";
import { useCinemaDemoStore } from "@/stores/cinema-demo-store";

type Props = {
  featureId: number;
  children?: ReactNode;
  durationMs?: number;
  className?: string;
};

export function FeatureMoment({ featureId, children, durationMs = 5000, className = "" }: Props) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const markFeatureSeen = useCinemaDemoStore((s) => s.markFeatureSeen);
  const [visible, setVisible] = useState(true);
  const feature = getFeature(featureId);

  useEffect(() => {
    markFeatureSeen(featureId);
    const id = window.setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(id);
  }, [featureId, durationMs, markFeatureSeen]);

  if (!visible || !feature) return null;

  return (
    <div className={`cinema-feature-moment ${className}`} role="status">
      {feature.badge ? <span className="cinema-feature-badge">{feature.badge}</span> : null}
      <strong>{isAr ? feature.titleAr : feature.titleEn}</strong>
      {children}
    </div>
  );
}
