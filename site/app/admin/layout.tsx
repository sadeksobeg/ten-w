"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { InviteShell } from "@/components/invite/InviteShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InviteShell className="text-white/90">{children}</InviteShell>
    </SessionProvider>
  );
}
