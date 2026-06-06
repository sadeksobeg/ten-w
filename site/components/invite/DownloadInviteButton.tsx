"use client";

import { useState } from "react";
import type { InviteCardPublic } from "@/lib/invite/get-card";
import {
  downloadInviteBlob,
  generateInviteCardCanvas,
} from "@/lib/invite/generate-card-canvas";

type Props = {
  card: InviteCardPublic;
  origin: string;
  label?: string;
  className?: string;
  large?: boolean;
};

export function DownloadInviteButton({
  card,
  origin,
  label = "تحميل بطاقة الدعوة",
  className = "",
  large = false,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    setLoading(true);
    try {
      const handle = card.handle.replace(/^@/, "");
      const blob = await generateInviteCardCanvas({
        name: card.name,
        handle,
        tier: card.tier,
        token: card.token,
        scope: card.scope,
        message: card.message,
        inviteUrl: `${origin}/invite/${card.slug}`,
      });
      downloadInviteBlob(blob, `tenegta-invite-${handle}.png`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void onDownload()}
      className={`invite-download-btn ${large ? "w-full max-w-[340px]" : ""} ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={loading ? "invite-spin" : ""}
        aria-hidden
      >
        <path d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      {loading ? "جاري التحضير…" : label}
    </button>
  );
}
