"use client";

import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";
import { CreatorMessageBubble } from "./CreatorMessageBubble";

const GROUP_MS = 5 * 60 * 1000;

type Props = {
  messages: ChatRoomMessageDTO[];
  viewerUserId: string;
  failedId: string | null;
  onReaction: (messageId: string, emoji: string) => void;
};

function showAvatarRow(idx: number, list: ChatRoomMessageDTO[]): boolean {
  const m = list[idx]!;
  if (["CHALLENGE_SUBMIT", "BATTLE_RESULT", "ACHIEVEMENT", "SYSTEM"].includes(m.kind)) return true;
  if (idx === 0) return true;
  const prev = list[idx - 1]!;
  if (prev.senderUserId !== m.senderUserId) return true;
  if (["CHALLENGE_SUBMIT", "BATTLE_RESULT", "ACHIEVEMENT", "SYSTEM"].includes(prev.kind)) return true;
  return new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > GROUP_MS;
}

export function CreatorMessageList({ messages, viewerUserId, failedId, onReaction }: Props) {
  return (
    <>
      {messages.map((m, idx) => {
        const mine = m.senderUserId === viewerUserId;
        const showAvatar = !mine && showAvatarRow(idx, messages);
        const showName = showAvatar;
        const showTime = showAvatarRow(idx, messages);
        return (
          <CreatorMessageBubble
            key={m.id}
            message={m}
            mine={mine}
            showAvatar={showAvatar}
            showName={showName}
            showTime={showTime}
            failed={failedId === m.id}
            onReaction={onReaction}
          />
        );
      })}
    </>
  );
}
