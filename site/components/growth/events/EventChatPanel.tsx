"use client";

import { eventRoomSlug } from "@/lib/growth/chat-room-service";
import { GrowthCommunityChat } from "@/components/growth/chat/GrowthCommunityChat";

type Props = {
  locale: string;
  eventSlug: string;
  viewerUserId: string;
  viewerEmail: string;
  viewerName: string | null;
};

export function EventChatPanel({
  locale,
  eventSlug,
  viewerUserId,
  viewerEmail,
  viewerName,
}: Props) {
  return (
    <GrowthCommunityChat
      locale={locale}
      viewerUserId={viewerUserId}
      viewerEmail={viewerEmail}
      viewerName={viewerName}
      roomSlug={eventRoomSlug(eventSlug)}
      hintKey="eventChatHint"
      placeholderKey="eventChatPlaceholder"
    />
  );
}
