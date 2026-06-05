import type { ReactNode } from "react";
import { InviteShell } from "@/components/invite/InviteShell";

export default function InviteLayout({ children }: { children: ReactNode }) {
  return <InviteShell>{children}</InviteShell>;
}
