"use client";

import { useTranslations } from "next-intl";
import { GrowthCommunityChat } from "@/components/growth/chat/GrowthCommunityChat";
import { GlassCard } from "@/components/growth/ui/GlassCard";
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
  className?: string;
};

export function CreatorLoungeChat({ locale, isRoomMember, viewer, className = "" }: Props) {
  const t = useTranslations("Growth.creators");

  return (
    <GlassCard className={`overflow-hidden border border-gold/25 bg-black/40 p-0 ${className}`}>
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-[family-name:var(--font-cairo)] text-sm font-extrabold text-gold">
          {t("lounge.homeChatTitle")}
        </h3>
        <p className="mt-0.5 text-[10px] text-white/45">
          {t("chat.charLimit", { max: CHAR_LIMIT })}
        </p>
      </div>
      {isRoomMember ? (
        <div className="h-[min(50dvh,420px)] sm:h-[min(58vh,480px)]">
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
          />
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {t("ctaPending")}
          </p>
        </div>
      )}
    </GlassCard>
  );
}
