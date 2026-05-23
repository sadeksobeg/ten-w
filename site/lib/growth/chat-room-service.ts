import { ChatRoomType, ParticipantStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CHAT_BADGE_KEYS } from "@/lib/growth/badge-visual";
import { matchChatKeywords } from "@/lib/growth/chat-keywords";
import { touchLastSeen } from "@/lib/growth/presence";

export const COMMUNITY_ROOM_SLUG = "community";

export type ChatRoomMessageDTO = {
  id: string;
  roomId: string;
  senderUserId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  senderAvatarPreset: string | null;
  senderLevelCode: string | null;
  isVerifiedOfficial: boolean;
  officialDisplayName: string | null;
  senderChatBadges: string[];
  body: string;
  kind: string;
  metadata: Record<string, unknown> | null;
  isOfficial: boolean;
  triggerKey: string | null;
  createdAt: string;
};

export function eventRoomSlug(eventSlug: string): string {
  return `event-${eventSlug}`;
}

async function ensureCommunityRoom() {
  let room = await prisma.chatRoom.findUnique({
    where: { slug: COMMUNITY_ROOM_SLUG },
  });
  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        slug: COMMUNITY_ROOM_SLUG,
        type: ChatRoomType.COMMUNITY,
        title: "T.E.N.E.G.T.A Community",
        isPublic: true,
      },
    });
  }
  return room;
}

export async function ensureCommunityMember(userId: string) {
  const room = await ensureCommunityRoom();
  await prisma.chatRoomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId } },
    create: { roomId: room.id, userId },
    update: {},
  });
  return room;
}

export async function ensureEventRoom(eventId: string) {
  const existing = await prisma.chatRoom.findUnique({ where: { eventId } });
  if (existing) return existing;

  const event = await prisma.growthEvent.findUnique({
    where: { id: eventId },
    select: { slug: true, title: true },
  });
  if (!event) throw new Error("event_not_found");

  const slug = eventRoomSlug(event.slug);
  const bySlug = await prisma.chatRoom.findUnique({ where: { slug } });
  if (bySlug) return bySlug;

  return prisma.chatRoom.create({
    data: {
      slug,
      type: ChatRoomType.EVENT,
      title: event.title,
      isPublic: false,
      eventId,
    },
  });
}

export async function ensureEventRoomBySlug(eventSlug: string) {
  const event = await prisma.growthEvent.findUnique({
    where: { slug: eventSlug },
    select: { id: true },
  });
  if (!event) throw new Error("event_not_found");
  return ensureEventRoom(event.id);
}

export async function assertEventParticipant(userId: string, eventId: string) {
  const part = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: { status: true },
  });
  if (!part || part.status !== ParticipantStatus.ACCEPTED) {
    throw new Error("not_event_member");
  }
}

export async function ensureEventMember(userId: string, roomId: string) {
  await prisma.chatRoomMember.upsert({
    where: { roomId_userId: { roomId, userId } },
    create: { roomId, userId },
    update: {},
  });
}

async function chatBadgeMap(userIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (userIds.length === 0 || CHAT_BADGE_KEYS.length === 0) return map;

  const rows = await prisma.userBadge.findMany({
    where: {
      userId: { in: userIds },
      badge: { key: { in: CHAT_BADGE_KEYS } },
    },
    include: { badge: { select: { key: true } } },
  });

  for (const row of rows) {
    const list = map.get(row.userId) ?? [];
    list.push(row.badge.key);
    map.set(row.userId, list);
  }
  return map;
}

function mapSender(user: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  avatarPreset: string | null;
  isVerifiedOfficial: boolean;
  officialDisplayName: string | null;
  partnerProfile: { currentLevel: { code: string } } | null;
}): Pick<
  ChatRoomMessageDTO,
  | "senderName"
  | "senderAvatarUrl"
  | "senderAvatarPreset"
  | "senderLevelCode"
  | "isVerifiedOfficial"
  | "officialDisplayName"
> {
  return {
    senderName:
      user.isVerifiedOfficial && user.officialDisplayName?.trim()
        ? user.officialDisplayName.trim()
        : user.name?.trim() || user.email,
    senderAvatarUrl: user.avatarUrl,
    senderAvatarPreset: user.avatarPreset,
    senderLevelCode: user.partnerProfile?.currentLevel.code ?? null,
    isVerifiedOfficial: user.isVerifiedOfficial,
    officialDisplayName: user.officialDisplayName,
  };
}

export async function listRoomMessages(
  roomId: string,
  opts?: { after?: Date; take?: number },
): Promise<ChatRoomMessageDTO[]> {
  const rows = await prisma.chatRoomMessage.findMany({
    where: {
      roomId,
      ...(opts?.after ? { createdAt: { gt: opts.after } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: opts?.take ?? 120,
    include: {
      sender: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
          avatarPreset: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
          partnerProfile: { select: { currentLevel: { select: { code: true } } } },
        },
      },
    },
  });

  const badges = await chatBadgeMap([...new Set(rows.map((m) => m.senderUserId))]);

  return rows.map((m) => ({
    id: m.id,
    roomId: m.roomId,
    senderUserId: m.senderUserId,
    ...mapSender(m.sender),
    senderChatBadges: badges.get(m.senderUserId) ?? [],
    body: m.body,
    kind: m.kind,
    metadata: (m.metadata as Record<string, unknown> | null) ?? null,
    isOfficial: m.isOfficial,
    triggerKey: m.triggerKey,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function appendRoomMessage(input: {
  roomId: string;
  senderUserId: string;
  body: string;
  kind?: string;
  metadata?: Record<string, unknown>;
  isOfficial?: boolean;
  triggerKey?: string;
}) {
  const msg = await prisma.chatRoomMessage.create({
    data: {
      roomId: input.roomId,
      senderUserId: input.senderUserId,
      body: input.body,
      kind: input.kind ?? "TEXT",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue,
      isOfficial: input.isOfficial ?? false,
      triggerKey: input.triggerKey ?? null,
    },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
          avatarPreset: true,
          isVerifiedOfficial: true,
          officialDisplayName: true,
          partnerProfile: { select: { currentLevel: { select: { code: true } } } },
        },
      },
    },
  });

  const badgeList = (await chatBadgeMap([msg.senderUserId])).get(msg.senderUserId) ?? [];

  return {
    id: msg.id,
    roomId: msg.roomId,
    senderUserId: msg.senderUserId,
    ...mapSender(msg.sender),
    senderChatBadges: badgeList,
    body: msg.body,
    kind: msg.kind,
    metadata: (msg.metadata as Record<string, unknown> | null) ?? null,
    isOfficial: msg.isOfficial,
    triggerKey: msg.triggerKey,
    createdAt: msg.createdAt.toISOString(),
  } satisfies ChatRoomMessageDTO;
}

export async function resolveChatRoomForUser(slug: string, userId: string) {
  if (slug === COMMUNITY_ROOM_SLUG) {
    const room = await ensureCommunityMember(userId);
    return { room, kind: "community" as const };
  }

  if (slug.startsWith("event-")) {
    const eventSlug = slug.slice("event-".length);
    const room = await ensureEventRoomBySlug(eventSlug);
    if (!room.eventId) throw new Error("invalid_event_room");
    await assertEventParticipant(userId, room.eventId);
    await ensureEventMember(userId, room.id);
    return { room, kind: "event" as const };
  }

  return null;
}

export async function postCommunityMessage(senderUserId: string, body: string) {
  await touchLastSeen(prisma, senderUserId);
  const room = await ensureCommunityMember(senderUserId);
  const user = await prisma.user.findUnique({
    where: { id: senderUserId },
    select: { isVerifiedOfficial: true, role: true },
  });
  const isOfficial = Boolean(user?.isVerifiedOfficial);

  const message = await appendRoomMessage({
    roomId: room.id,
    senderUserId,
    body,
    isOfficial,
  });

  if (!isOfficial) {
    const match = matchChatKeywords(body);
    if (match) {
      await appendRoomMessage({
        roomId: room.id,
        senderUserId,
        body: "",
        kind: "ACTION",
        metadata: { links: match.links, triggerKey: match.triggerKey },
        triggerKey: match.triggerKey,
      });
    }
  }

  return message;
}

export async function postEventRoomMessage(senderUserId: string, roomSlug: string, body: string) {
  await touchLastSeen(prisma, senderUserId);
  const resolved = await resolveChatRoomForUser(roomSlug, senderUserId);
  if (!resolved || resolved.kind !== "event") {
    throw new Error("not_found");
  }

  return appendRoomMessage({
    roomId: resolved.room.id,
    senderUserId,
    body,
  });
}

export async function seedOfficialWelcomeIfEmpty(roomId: string, adminUserId: string) {
  const count = await prisma.chatRoomMessage.count({ where: { roomId } });
  if (count > 0) return;
  await appendRoomMessage({
    roomId,
    senderUserId: adminUserId,
    body: "welcome_official",
    kind: "SYSTEM",
    isOfficial: true,
    metadata: { pinned: true },
  });
}
