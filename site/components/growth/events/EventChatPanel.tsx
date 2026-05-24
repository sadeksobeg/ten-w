"use client";

import { eventRoomSlug } from "@/lib/growth/chat-room-service";
import { GrowthCommunityChat } from "@/components/growth/chat/GrowthCommunityChat";

type Props = {
  locale: string;
  eventSlug: string;
  viewerUserId: string;
  viewerEmail: string;
  viewerName: string | null;
  viewerDisplayName?: string;
  viewerAvatarUrl?: string | null;
  viewerAvatarPreset?: string | null;
};

export function EventChatPanel({
  locale,
  eventSlug,
  viewerUserId,
  viewerEmail,
  viewerName,
  viewerDisplayName,
  viewerAvatarUrl,
  viewerAvatarPreset,
}: Props) {
  return (
    <GrowthCommunityChat
      locale={locale}
      viewerUserId={viewerUserId}
      viewerEmail={viewerEmail}
      viewerName={viewerName}
      viewerDisplayName={viewerDisplayName}
      viewerAvatarUrl={viewerAvatarUrl}
      viewerAvatarPreset={viewerAvatarPreset}
      roomSlug={eventRoomSlug(eventSlug)}
      hintKey="eventChatHint"
      placeholderKey="eventChatPlaceholder"
    />
  );
}
