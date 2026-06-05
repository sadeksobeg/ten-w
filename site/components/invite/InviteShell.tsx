import type { ReactNode } from "react";
import { InviteFonts } from "@/components/invite/InviteFonts";
import "@/app/invite/invite-globals.css";

type Props = {
  children: ReactNode;
  dir?: "ltr" | "rtl";
  className?: string;
};

export function InviteShell({ children, dir = "rtl", className = "" }: Props) {
  return (
    <html lang="ar" dir={dir} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <InviteFonts />
        <link rel="icon" href="/tenegta-icon.png" type="image/png" />
      </head>
      <body
        className={`invite-root invite-grid-bg invite-font-heading min-h-[100dvh] ${className}`}
      >
        {children}
      </body>
    </html>
  );
}
