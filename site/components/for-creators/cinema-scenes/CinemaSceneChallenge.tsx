"use client";

import { HubPreviewChallenge } from "../hub-preview/HubPreviewChallenge";

export function CinemaSceneChallenge() {
  return (
    <div className="relative h-full bg-gradient-to-br from-[#140810] to-[#0a0612]">
      <div className="fc-cinema-trophy-glow pointer-events-none absolute end-4 top-4 size-16 rounded-full opacity-60" aria-hidden />
      <div className="absolute inset-3 overflow-hidden rounded-xl border border-amber-500/20 bg-black/45 backdrop-blur-md">
        <HubPreviewChallenge />
      </div>
    </div>
  );
}
