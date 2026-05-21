import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/growth-globals.css";
import { auth } from "@/auth";
import { GrowthSessionProvider } from "@/components/growth/GrowthSessionProvider";
import { GrowthTopBar } from "@/components/growth/GrowthTopBar";
import { ToastHost } from "@/components/growth/ui/Toast";

/** Partner portal — must not be indexed (credential forms trigger Safe Browsing). */
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function GrowthLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  const showPartnerBar = session?.user?.role === "PARTNER";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <GrowthSessionProvider session={session}>
      <div className="growth-root relative isolate min-h-[calc(100vh-4rem)] bg-[#0A0A0F] text-[var(--growth-text)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_circle_at_90%_10%,rgba(201,160,97,0.16),transparent_50%)]"
        />
        <div
          className={`relative mx-auto px-4 py-8 sm:px-6 lg:px-8 ${isAdmin ? "max-w-[90rem]" : "max-w-7xl"}`}
        >
          {showPartnerBar ? <GrowthTopBar locale={locale} variant="partner" /> : null}
          <div className="growth-page-enter">{children}</div>
        </div>
        <ToastHost />
      </div>
    </GrowthSessionProvider>
  );
}
