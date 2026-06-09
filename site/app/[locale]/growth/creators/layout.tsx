import type { ReactNode } from "react";

type Props = { children: ReactNode };

/** Creator Hub uses immersive app chrome (see CreatorHubAppMode + growth-globals.css). */
export default function GrowthCreatorsLayout({ children }: Props) {
  return children;
}
