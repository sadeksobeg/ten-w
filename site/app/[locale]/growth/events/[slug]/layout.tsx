import type { ReactNode } from "react";

type Props = { children: ReactNode };

/** Event detail uses full-bleed member feed on mobile (see growth-globals.css). */
export default function GrowthEventDetailLayout({ children }: Props) {
  return <div className="growth-event-detail-layout">{children}</div>;
}
