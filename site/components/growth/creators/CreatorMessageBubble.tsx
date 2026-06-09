"use client";

import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";
import {
  IconFire,
  IconStar,
  IconThumbUp,
  IconHeart,
  IconTrophy,
  IconLightning,
} from "@/components/growth/icons/GrowthIcons";
import { CreatorChatSpecialCard } from "./CreatorChatSpecialCard";
import { CreatorNameWithConsentBadge } from "./CreatorConsentVerifiedBadge";

import type { ComponentType } from "react";

const REACTION_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  fire: IconFire,
  star: IconStar,
  thumb: IconThumbUp,
  heart: IconHeart,
  trophy: IconTrophy,
  lightning: IconLightning,
};

const REACTIONS = ["fire", "star", "thumb", "heart", "trophy", "lightning"] as const;

type Props = {
  message: ChatRoomMessageDTO;
  mine: boolean;
  showAvatar: boolean;
  showName: boolean;
  showTime: boolean;
  failed?: boolean;
  onReaction: (messageId: string, emoji: string) => void;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function CreatorMessageBubble({
  message,
  mine,
  showAvatar,
  showName,
  showTime,
  failed,
  onReaction,
}: Props) {
  const t = useTranslations("Creators.chat");
  const tConsent = useTranslations("Creators.consent");

  if (["CHALLENGE_SUBMIT", "BATTLE_RESULT", "ACHIEVEMENT", "SYSTEM"].includes(message.kind)) {
    return <CreatorChatSpecialCard message={message} />;
  }

  return (
    <div className={`group relative mb-1 flex ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && showAvatar ? (
        <GrowthAvatar
          name={message.senderName}
          email={message.senderUserId}
          avatarUrl={message.senderAvatarUrl}
          size="sm"
          className="me-2 mt-1 size-9 shrink-0"
        />
      ) : !mine ? (
        <div className="me-2 w-9 shrink-0" aria-hidden />
      ) : null}
      <div className={`max-w-[85%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
        {!mine && showName ? (
          <p className="mb-0.5 flex items-center gap-2 ps-1 text-[10px] font-semibold text-[var(--creator-accent)]">
            <CreatorNameWithConsentBadge
              name={message.senderName}
              verified={message.senderConsentGiven}
              label={tConsent("verifiedBadge")}
              nameClassName="font-semibold"
            />
            {showTime ? <span className="font-normal text-white/35">{formatTime(message.createdAt)}</span> : null}
          </p>
        ) : null}
        <div className="relative">
          <div
            className={`creator-chat-reaction-bar absolute -top-8 ${mine ? "end-0" : "start-0"} z-10 flex gap-0.5 rounded-full border border-white/10 bg-[var(--creator-surface-2)]/95 px-1.5 py-1 opacity-0 shadow-lg transition group-hover:opacity-100`}
          >
            {REACTIONS.map((key) => {
              const Icon = REACTION_ICONS[key]!;
              return (
                <button
                  key={key}
                  type="button"
                  className="rounded p-0.5 text-white/55 hover:text-[var(--creator-secondary)]"
                  onClick={() => onReaction(message.id, key)}
                  aria-label={key}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          <div className={`px-3 py-2 text-sm ${mine ? "creator-bubble-mine" : "creator-bubble-them"}`}>
            {message.body}
            {failed ? <p className="mt-1 text-[10px] text-rose-300">{t("failed")}</p> : null}
          </div>
        </div>
        {message.reactions.length > 0 ? (
          <div className={`mt-1 flex flex-wrap gap-1 ${mine ? "justify-end" : "justify-start"}`}>
            {message.reactions.map((r) => {
              const Icon = REACTION_ICONS[r.emoji];
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onReaction(message.id, r.emoji)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${
                    r.mine
                      ? "border-[var(--creator-secondary)]/50 bg-[var(--creator-secondary)]/25 text-amber-100"
                      : "border-white/12 bg-white/[0.08] text-white/65"
                  }`}
                >
                  {Icon ? <Icon size={10} /> : null}
                  {r.count}
                </button>
              );
            })}
          </div>
        ) : null}
        {mine && showTime ? (
          <p className="mt-0.5 text-end text-[9px] text-white/35">{formatTime(message.createdAt)}</p>
        ) : null}
      </div>
    </div>
  );
}
