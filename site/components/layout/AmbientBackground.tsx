"use client";

/** Animated gradient orbs + subtle depth behind all pages. */
export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="ambient-orb ambient-orb-a absolute -left-[20%] top-[-10%] h-[55vh] w-[55vw] rounded-full bg-gold/15 blur-[100px]" />
      <div className="ambient-orb ambient-orb-b absolute -right-[15%] bottom-[-15%] h-[45vh] w-[50vw] rounded-full bg-[#1f1a14] blur-[90px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,160,97,0.07),transparent_55%)]" />
    </div>
  );
}
