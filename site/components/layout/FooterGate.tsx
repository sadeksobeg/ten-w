"use client";

import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function FooterGate({ children }: Props) {
  const pathname = usePathname();
  if (pathname.includes("/growth/creators")) {
    return null;
  }
  return children;
}
