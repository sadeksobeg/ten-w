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
  avatarLabel?: string;
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

function avatarInitial(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return label.slice(0, 2).toUpperCase();
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
  avatarLabel,
}: Props) {
  const mine = m.senderUserId === viewerUserId;
  const kindUpper = m.kind.toUpperCase();
  const rich = ["BONUS", "BADGE", "SYSTEM", "WARNING", "ACTION"].includes(kindUpper);
  const nf =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const time = new Intl.DateTimeFormat(nf, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(m.createdAt));

  const label =
    avatarLabel ?? (mine ? (isAdmin ? adminTag : partnerTag) : isAdmin ? partnerTag : adminTag);

  const [bonusFlash, setBonusFlash] = useState(kindUpper === "BONUS");
  useEffect(() => {
    if (kindUpper !== "BONUS") {
      queueMicrotask(() => setBonusFlash(false));
      return;
    }
    queueMicrotask(() => setBonusFlash(true));
    const id = window.setTimeout(() => setBonusFlash(false), 900);
    return () => window.clearTimeout(id);
  }, [m.id, kindUpper]);

  if (kindUpper === "SYSTEM") {
    return (
      <div className={`flex justify-center py-1.5 ${showAvatarRow ? "pt-2" : "pt-0.5"}`}>
        <p className="max-w-[88%] rounded-2xl bg-white/[0.04] px-4 py-2 text-center text-[11px] italic text-white/50">
          {m.body}
        </p>
      </div>
    );
  }

  if (rich) {
    const tone = bubbleTone(kindUpper);
    const flash = kindUpper === "BONUS" && bonusFlash;
    return (
      <div
        className={`motion-safe:animate-in motion-safe:fade-in flex justify-center py-1 ${
          showAvatarRow ? "pt-2" : "pt-0.5"
        }`}
      >
        <div
          className={`max-w-[min(92%,420px)] rounded-2xl border px-4 py-2.5 text-sm transition-shadow duration-500 ${tone} ${
            flash ? "shadow-[0_0_40px_rgba(234,179,8,0.55)] ring-2 ring-gold/50" : ""
          }`}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
            {kindLabel(kindUpper)}
          </div>
          <div className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
          <div className="mt-1.5 text-end text-[10px] text-white/35">{time}</div>
        </div>
      </div>
    );
  }

  const toneExtra = textToneClass(m.metadata);

  return (
    <div
      className={`flex gap-2 py-0.5 ${mine ? "flex-row-reverse" : "flex-row"} ${
        showAvatarRow ? "pt-2" : "pt-0.5"
      }`}
    >
      {showAvatarRow ? (
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
            mine
              ? "bg-[#B07D2B]/90 text-white"
              : "bg-white/12 text-white/80 ring-1 ring-white/15"
          }`}
          aria-hidden
        >
          {avatarInitial(label)}
        </div>
      ) : (
        <div className="size-8 shrink-0" aria-hidden />
      )}
      <div
        className={`max-w-[min(78%,380px)] ${mine ? "items-end" : "items-start"} flex flex-col`}
      >
        {showAvatarRow ? (
          <span
            className={`mb-0.5 px-1 text-[10px] font-semibold text-white/40 ${
              mine ? "text-end" : "text-start"
            }`}
          >
            {label}
          </span>
        ) : null}
        <div
          className={`px-3.5 py-2 text-sm shadow-md ${
            mine
              ? "rounded-2xl rounded-ee-md bg-gradient-to-br from-[#B07D2B] to-[#8a6322] text-white"
              : `rounded-2xl rounded-es-md border border-white/10 bg-[#121a2e] text-white/92 ${toneExtra}`
          }`}
        >
          <div className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
          <div
            className={`mt-1 text-[10px] ${mine ? "text-white/55" : "text-white/40"} ${
              mine ? "text-end" : "text-start"
            }`}
          >
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}
