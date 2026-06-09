"use client";

import { useTranslations } from "next-intl";
import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";
import { IconTrophy, IconVideo } from "@/components/growth/icons/GrowthIcons";

type Props = { message: ChatRoomMessageDTO };

export function CreatorChatSpecialCard({ message }: Props) {
  const t = useTranslations("Creators.chat.special");
  const meta = message.metadata ?? {};

  if (message.kind === "CHALLENGE_SUBMIT") {
    const platform = typeof meta.platform === "string" ? meta.platform : "";
    const url = typeof meta.url === "string" ? meta.url : "";
    const creatorName = typeof meta.creatorName === "string" ? meta.creatorName : message.senderName;
    return (
      <div className="creator-chat-special mx-auto my-3 max-w-[280px] rounded-xl border-s-[3px] border-s-[var(--creator-primary)] bg-rose-950/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-rose-200">
          <IconVideo size={16} />
          <span className="text-xs font-bold">{t("challengeSubmit")}</span>
        </div>
        <p className="mt-2 text-sm font-bold text-white">{creatorName}</p>
        {platform ? <p className="mt-1 text-[10px] uppercase text-white/45">{platform}</p> : null}
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-[var(--creator-secondary)] underline">
            {t("viewContent")}
          </a>
        ) : null}
      </div>
    );
  }

  if (message.kind === "BATTLE_RESULT") {
    const winner = typeof meta.winner === "string" ? meta.winner : "";
    const score = typeof meta.score === "string" ? meta.score : "";
    return (
      <div className="creator-chat-special mx-auto my-3 max-w-[280px] rounded-xl border border-[var(--creator-secondary)]/40 bg-amber-950/25 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-200">
          <IconTrophy size={16} className="text-[var(--creator-secondary)]" />
          <span className="text-xs font-bold">{t("battleResult")}</span>
        </div>
        <p className="mt-2 text-sm font-bold text-[var(--creator-secondary)]">{winner}</p>
        {score ? <p className="mt-1 font-mono text-xs text-white/55">{score}</p> : null}
      </div>
    );
  }

  if (message.kind === "ACHIEVEMENT") {
    const badgeName = typeof meta.badgeName === "string" ? meta.badgeName : "";
    const userName = typeof meta.userName === "string" ? meta.userName : message.senderName;
    return (
      <div className="creator-chat-special mx-auto my-3 max-w-[280px] rounded-xl border border-violet-500/35 bg-violet-950/30 p-4 text-center">
        <p className="text-xs font-bold text-violet-200">{t("achievement")}</p>
        <p className="mt-2 text-sm text-white">{t("achievementBody", { name: userName, badge: badgeName })}</p>
      </div>
    );
  }

  if (message.kind === "SYSTEM") {
    return (
      <p className="my-2 text-center text-[11px] text-white/40">{message.body}</p>
    );
  }

  return null;
}
