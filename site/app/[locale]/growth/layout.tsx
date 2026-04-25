import type { ReactNode } from "react";
import { auth } from "@/auth";
import { GrowthSessionProvider } from "@/components/growth/GrowthSessionProvider";

type Props = {
  children: ReactNode;
};

export default async function GrowthLayout({ children }: Props) {
  const session = await auth();

  return (
    <GrowthSessionProvider session={session}>
      <div className="relative isolate min-h-[calc(100vh-4rem)] bg-[#050816] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_circle_at_90%_10%,rgba(201,160,97,0.16),transparent_50%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </GrowthSessionProvider>
  );
}
