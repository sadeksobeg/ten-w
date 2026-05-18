"use client";

import { useEffect, useState } from "react";
import type { ChatMessageDTO } from "@/lib/growth/chat-service";

type Props = {
  message: ChatMessageDTO;
  viewerUserId: string;
  isAdmin: boolean;
  locale: string;
  showAvatarRow: boolean;
  kindLabel: (kind: string) => string;
  partnerTag: string;
  adminTag: string;
};

function bubbleTone(kind: string): string {
  switch (kind) {
    case "BONUS":
      return "border-emerald-400/35 bg-emerald-500/10 text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.18)]";
    case "BADGE":
      return "border-gold/40 bg-gold/10 text-white shadow-[0_0_26px_rgba(234,179,8,0.2)]";
    case "SYSTEM":
      return "border-white/12 bg-white/[0.06] text-white/90";
    case "WARNING":
      return "border-rose-400/35 bg-rose-500/10 text-rose-50 shadow-[0_0_22px_rgba(244,63,94,0.15)]";
    case "ACTION":
      return "border-sky-400/35 bg-sky-500/10 text-sky-50";
    default:
      return "";
  }
}

function textToneClass(metadata: Record<string, unknown> | null): string {
  const tone = typeof metadata?.tone === "string" ? metadata.tone : null;
  switch (tone) {
    case "strategic":
      return "border-violet-400/30 bg-violet-500/10 ring-1 ring-violet-400/15";
    case "urgent":
      return "border-rose-400/35 bg-rose-950/30 ring-1 ring-rose-400/20";
    case "reward":
      return "border-gold/40 bg-gold/5 ring-1 ring-gold/25";
    default:
      return "";
  }
}

export function GrowthChatMessageBubble({
  message: m,
  viewerUserId,
  isAdmin,
  locale,
  showAvatarRow,
  kindLabel,
  partnerTag,
  adminTag,
}: Props) {
  const mine = m.senderUserId === viewerUserId;
  const rich = ["BONUS", "BADGE", "SYSTEM", "WARNING", "ACTION"].includes(m.kind);
  const nf =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const time = new Intl.DateTimeFormat(nf, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(m.createdAt));

  const [bonusFlash, setBonusFlash] = useState(m.kind === "BONUS");
  useEffect(() => {
    if (m.kind !== "BONUS") {
      queueMicrotask(() => setBonusFlash(false));
      return;
    }
    queueMicrotask(() => setBonusFlash(true));
    const id = window.setTimeout(() => setBonusFlash(false), 900);
    return () => window.clearTimeout(id);
  }, [m.id, m.kind]);

  if (rich) {
    const tone = bubbleTone(m.kind);
    const flash = m.kind === "BONUS" && bonusFlash;
    return (
      <div
        className={`motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 flex justify-center py-0.5 ${
          showAvatarRow ? "pt-1" : ""
        }`}
      >
        <div
          className={`max-w-[92%] rounded-2xl border px-3 py-2 text-sm transition-shadow duration-500 ${tone} ${
            flash ? "shadow-[0_0_40px_rgba(234,179,8,0.55)] ring-2 ring-gold/50" : ""
          }`}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
            {kindLabel(m.kind)}
          </div>
          <div className="mt-1 whitespace-pre-wrap break-words">{m.body}</div>
          <div className="mt-1 text-[10px] text-white/35">{time}</div>
        </div>
      </div>
    );
  }

  const toneExtra = textToneClass(m.metadata);

  return (
    <div
      className={`motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 flex ${
        mine ? "justify-end" : "justify-start"
      } py-0.5 ${showAvatarRow ? "pt-1.5" : ""}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl border border-transparent px-3 py-2 text-sm transition-transform duration-200 hover:scale-[1.01] ${
          mine
            ? "bg-gradient-to-br from-gold/25 to-gold/10 text-white"
            : `bg-white/[0.06] text-white/85 ${toneExtra}`
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{m.body}</div>
        <div className="mt-1 text-[10px] text-white/40">
          {time}
          {isAdmin && !mine ? ` · ${partnerTag}` : null}
          {!isAdmin && !mine ? ` · ${adminTag}` : null}
        </div>
      </div>
    </div>
  );
}
