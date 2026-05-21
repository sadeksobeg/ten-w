import type { Metadata } from "next";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { GrowthSessionProvider } from "@/components/growth/GrowthSessionProvider";
import { GrowthTopBar } from "@/components/growth/GrowthTopBar";

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

  return (
    <GrowthSessionProvider session={session}>
      <div className="relative isolate min-h-[calc(100vh-4rem)] bg-[#050816] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_circle_at_90%_10%,rgba(201,160,97,0.16),transparent_50%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {showPartnerBar ? <GrowthTopBar locale={locale} variant="partner" /> : null}
          {children}
        </div>
      </div>
    </GrowthSessionProvider>
  );
}
