"use client";

import { useTranslations } from "next-intl";
import { GrowthCommunityChat } from "@/components/growth/chat/GrowthCommunityChat";
import { CREATOR_ROOM_SLUG } from "@/lib/growth/creator-program";

const CHAR_LIMIT = 280;

type ChatViewer = {
  userId: string;
  email: string;
  name: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
};

type Props = {
  locale: string;
  isRoomMember: boolean;
  viewer: ChatViewer;
  isActive: boolean;
  onUnread?: (count: number) => void;
};

export function CreatorLoungeChatTab({
  locale,
  isRoomMember,
  viewer,
  isActive,
  onUnread,
}: Props) {
  const t = useTranslations("Growth.creators.lounge");

  if (!isRoomMember) {
    return (
      <div className="creator-arena-chat-tab flex min-h-[min(60dvh,480px)] items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/5 p-8 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-amber-100/90">
          {t("chatAccessPending")}
        </p>
      </div>
    );
  }

  return (
    <div className="creator-arena-chat-tab flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <h2 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
          {t("chatTabTitle")}
        </h2>
        <p className="mt-0.5 text-[11px] text-white/45">
          {t("chatTabSubtitle", { max: CHAR_LIMIT })}
        </p>
      </div>
      <div className="creator-arena-chat-panel min-h-0 flex-1">
        <GrowthCommunityChat
          locale={locale}
          viewerUserId={viewer.userId}
          viewerEmail={viewer.email}
          viewerName={viewer.name}
          viewerDisplayName={viewer.displayName}
          viewerAvatarUrl={viewer.avatarUrl}
          viewerAvatarPreset={viewer.avatarPreset}
          roomSlug={CREATOR_ROOM_SLUG}
          hintKey="creatorChatHint"
          placeholderKey="creatorChatPlaceholder"
          inputMaxLength={CHAR_LIMIT}
          enableRealtime
          isTabActive={isActive}
          onIncomingMessages={(count) => onUnread?.(count)}
        />
      </div>
    </div>
  );
}
