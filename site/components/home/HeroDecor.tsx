"use client";

/** Lightweight CSS “data nodes” (Lottie alternative for low-end devices). */
export function HeroDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-40"
      aria-hidden
    >
      <div
        className="hero-node-glow animation-delay-0 absolute left-[8%] top-[20%] h-2 w-2 rounded-full bg-gold shadow-[0_0_20px_rgba(201,160,97,0.8)]"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="hero-node-glow absolute right-[12%] top-[35%] h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_16px_rgba(255,215,0,0.7)]"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="hero-node-glow absolute bottom-[25%] left-[20%] h-2 w-2 rounded-full bg-gold shadow-[0_0_18px_rgba(201,160,97,0.75)]"
        style={{ animationDelay: "0.4s" }}
      />
      <div
        className="hero-node-glow absolute bottom-[30%] right-[25%] h-1 w-1 rounded-full bg-gold-bright"
        style={{ animationDelay: "0.6s" }}
      />
    </div>
  );
}
