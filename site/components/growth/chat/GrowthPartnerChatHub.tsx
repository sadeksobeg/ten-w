"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GrowthChatThread } from "@/components/growth/chat/GrowthChatThread";
import { GrowthCommunityChat } from "@/components/growth/chat/GrowthCommunityChat";
import { CREATOR_ROOM_SLUG } from "@/lib/growth/creator-program";

type Tab = "community" | "creators" | "support";

type Props = {
  locale: string;
  viewerUserId: string;
  viewerEmail: string;
  viewerName: string | null;
  supportConversationId: string;
  isCreatorRoomMember?: boolean;
  initialTab?: Tab;
};

export function GrowthPartnerChatHub({
  locale,
  viewerUserId,
  viewerEmail,
  viewerName,
  supportConversationId,
  isCreatorRoomMember = false,
  initialTab = "community",
}: Props) {
  const t = useTranslations("Growth.chat");
  const [tab, setTab] = useState<Tab>(
    initialTab === "creators" && isCreatorRoomMember ? "creators" : initialTab === "support" ? "support" : "community",
  );

  const tabClass = (active: boolean) =>
    `min-h-[var(--growth-touch-min)] flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
      active
        ? "bg-gradient-to-r from-gold/90 to-gold-bright text-bg"
        : "text-white/55 hover:bg-white/[0.04] hover:text-white"
    }`;

  return (
    <div className="flex h-[min(72vh,640px)] flex-col overflow-hidden">
      <div className="flex shrink-0 gap-1 border-b border-white/10 bg-black/20 p-1">
        <button type="button" className={tabClass(tab === "community")} onClick={() => setTab("community")}>
          {t("tabCommunity")}
        </button>
        {isCreatorRoomMember ? (
          <button type="button" className={tabClass(tab === "creators")} onClick={() => setTab("creators")}>
            {t("tabCreators")}
          </button>
        ) : null}
        <button type="button" className={tabClass(tab === "support")} onClick={() => setTab("support")}>
          {t("tabSupport")}
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {tab === "community" ? (
          <GrowthCommunityChat
            locale={locale}
            viewerUserId={viewerUserId}
            viewerEmail={viewerEmail}
            viewerName={viewerName}
          />
        ) : tab === "creators" ? (
          <GrowthCommunityChat
            locale={locale}
            viewerUserId={viewerUserId}
            viewerEmail={viewerEmail}
            viewerName={viewerName}
            roomSlug={CREATOR_ROOM_SLUG}
            hintKey="creatorChatHint"
            placeholderKey="creatorChatPlaceholder"
          />
        ) : (
          <GrowthChatThread
            conversationId={supportConversationId}
            viewerUserId={viewerUserId}
            isAdmin={false}
            locale={locale}
            embedded
            partnerHistoryMode
            hideThreadTitle
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}
