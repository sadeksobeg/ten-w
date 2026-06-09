import type { ReactNode } from "react";

type Props = { children: ReactNode };

/** Creator Hub shares the unified partner workspace chrome (GrowthWorkspaceNav + GrowthPartnerHeader). */
export default function GrowthCreatorsLayout({ children }: Props) {
  return children;
}
