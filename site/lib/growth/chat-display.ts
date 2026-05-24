import type { ChatRoomMessageDTO } from "@/lib/growth/chat-room-service";

export const VIEWER_CHAT_PROFILE_SELECT = {
  name: true,
  email: true,
  avatarUrl: true,
  avatarPreset: true,
  isVerifiedOfficial: true,
  officialDisplayName: true,
} as const;

export type ViewerChatProfile = {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  avatarPreset: string | null;
  isVerifiedOfficial: boolean;
  officialDisplayName: string | null;
};

export function resolveChatSenderName(user: {
  name: string | null;
  email: string;
  isVerifiedOfficial: boolean;
  officialDisplayName: string | null;
}): string {
  const official = user.officialDisplayName?.trim();
  if (user.isVerifiedOfficial && official) return official;
  const name = user.name?.trim();
  if (name) return name;
  return user.email.trim();
}

export function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export type ChatSenderProfile = Pick<
  ChatRoomMessageDTO,
  | "senderName"
  | "senderEmail"
  | "senderAvatarUrl"
  | "senderAvatarPreset"
  | "senderLevelCode"
  | "isVerifiedOfficial"
  | "officialDisplayName"
  | "senderChatBadges"
>;

export function senderProfileFrom(m: ChatRoomMessageDTO): ChatSenderProfile {
  return {
    senderName: m.senderName,
    senderEmail: m.senderEmail,
    senderAvatarUrl: m.senderAvatarUrl,
    senderAvatarPreset: m.senderAvatarPreset,
    senderLevelCode: m.senderLevelCode,
    isVerifiedOfficial: m.isVerifiedOfficial,
    officialDisplayName: m.officialDisplayName,
    senderChatBadges: m.senderChatBadges,
  };
}

function pickRicherSenderProfile(
  current: ChatSenderProfile,
  incoming: ChatSenderProfile,
): ChatSenderProfile {
  const senderName =
    isEmailLike(current.senderName) && !isEmailLike(incoming.senderName)
      ? incoming.senderName
      : !isEmailLike(incoming.senderName)
        ? incoming.senderName
        : current.senderName;

  return {
    senderName,
    senderEmail: incoming.senderEmail || current.senderEmail,
    senderAvatarUrl: incoming.senderAvatarUrl ?? current.senderAvatarUrl,
    senderAvatarPreset: incoming.senderAvatarPreset ?? current.senderAvatarPreset,
    senderLevelCode: incoming.senderLevelCode ?? current.senderLevelCode,
    isVerifiedOfficial: incoming.isVerifiedOfficial || current.isVerifiedOfficial,
    officialDisplayName: incoming.officialDisplayName ?? current.officialDisplayName,
    senderChatBadges:
      incoming.senderChatBadges.length >= current.senderChatBadges.length
        ? incoming.senderChatBadges
        : current.senderChatBadges,
  };
}

export function mergeChatRoomMessages(
  prev: ChatRoomMessageDTO[],
  incoming: ChatRoomMessageDTO[],
): ChatRoomMessageDTO[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  const senderProfiles = new Map<string, ChatSenderProfile>();

  for (const m of prev) {
    const existing = senderProfiles.get(m.senderUserId);
    senderProfiles.set(
      m.senderUserId,
      existing ? pickRicherSenderProfile(existing, senderProfileFrom(m)) : senderProfileFrom(m),
    );
  }

  for (const m of incoming) {
    map.set(m.id, m);
    const existing = senderProfiles.get(m.senderUserId);
    senderProfiles.set(
      m.senderUserId,
      existing ? pickRicherSenderProfile(existing, senderProfileFrom(m)) : senderProfileFrom(m),
    );
  }

  const merged = [...map.values()].map((m) => {
    const profile = senderProfiles.get(m.senderUserId);
    return profile ? { ...m, ...profile } : m;
  });

  return merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
