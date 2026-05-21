import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Public partner cards may be indexed for sharing / future QR. */
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

type Props = { children: ReactNode };

export default function GrowthPublicProfileLayout({ children }: Props) {
  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] bg-[#050816] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(700px_circle_at_90%_10%,rgba(201,160,97,0.16),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
