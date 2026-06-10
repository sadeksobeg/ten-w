"use client";

import { HubPreviewDashboard } from "../hub-preview/HubPreviewDashboard";

export function CinemaSceneHub() {
  return (
    <div className="relative h-full bg-gradient-to-br from-[#0c0618] via-[#120a22] to-[#0a0814]">
      <div className="absolute inset-x-4 top-3 h-8 rounded-lg border border-white/8 bg-white/[0.03]" aria-hidden />
      <div className="absolute inset-x-3 bottom-3 top-14 overflow-hidden rounded-xl border border-white/10 bg-black/50 backdrop-blur-md">
        <HubPreviewDashboard />
      </div>
    </div>
  );
}
