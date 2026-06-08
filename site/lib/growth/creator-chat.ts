import { ChatRoomType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CREATOR_CHANNEL_SLUGS,
  CREATOR_ANNOUNCEMENTS_SLUG,
  canAccessCreatorLounge,
  ensureCreatorChannels,
} from "@/lib/growth/creator-program";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

export type CreatorChatRoomPreview = {
  slug: string;
  title: string;
  unread: number;
  lastPreview: string | null;
  isDm: boolean;
};

function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function listCreatorChatRooms(userId: string): Promise<CreatorChatRoomPreview[]> {
  await ensureCreatorChannels();
  const rooms = await prisma.chatRoom.findMany({
    where: { slug: { in: CREATOR_CHANNEL_SLUGS.map((c) => c.slug) } },
    include: {
      members: { where: { userId }, select: { lastReadAt: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true } },
    },
  });

  const channelPreviews: CreatorChatRoomPreview[] = [];
  for (const ch of CREATOR_CHANNEL_SLUGS) {
    const room = rooms.find((r) => r.slug === ch.slug);
    if (!room) continue;
    const member = room.members[0];
    const lastMsg = room.messages[0];
    const unread = member?.lastReadAt
      ? await prisma.chatRoomMessage.count({
          where: { roomId: room.id, createdAt: { gt: member.lastReadAt }, senderUserId: { not: userId } },
        })
      : lastMsg
        ? 1
        : 0;
    channelPreviews.push({
      slug: ch.slug,
      title: ch.title,
      unread,
      lastPreview: lastMsg?.body?.slice(0, 80) ?? null,
      isDm: false,
    });
  }

  const dms = await prisma.creatorDirectRoom.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      room: {
        include: {
          members: { where: { userId }, select: { lastReadAt: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true } },
        },
      },
      userA: { select: { id: true, name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } },
      userB: { select: { id: true, name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const dm of dms) {
    const peer = dm.userAId === userId ? dm.userB : dm.userA;
    const member = dm.room.members[0];
    const lastMsg = dm.room.messages[0];
    const unread = member?.lastReadAt
      ? await prisma.chatRoomMessage.count({
          where: { roomId: dm.roomId, createdAt: { gt: member.lastReadAt }, senderUserId: { not: userId } },
        })
      : 0;
    channelPreviews.push({
      slug: dm.room.slug,
      title: resolveChatSenderName(peer),
      unread,
      lastPreview: lastMsg?.body?.slice(0, 80) ?? null,
      isDm: true,
    });
  }

  return channelPreviews;
}

export async function ensureCreatorDirectRoom(userAId: string, userBId: string) {
  const [a, b] = sortedPair(userAId, userBId);
  const existing = await prisma.creatorDirectRoom.findUnique({
    where: { userAId_userBId: { userAId: a, userBId: b } },
    include: { room: true },
  });
  if (existing) return existing.room;

  const slug = `creator-dm-${a.slice(0, 8)}-${b.slice(0, 8)}`;
  const room = await prisma.chatRoom.create({
    data: {
      slug,
      type: ChatRoomType.CREATOR,
      title: "DM",
      isPublic: false,
    },
  });
  await prisma.creatorDirectRoom.create({
    data: { userAId: a, userBId: b, roomId: room.id },
  });
  for (const uid of [a, b]) {
    await prisma.chatRoomMember.upsert({
      where: { roomId_userId: { roomId: room.id, userId: uid } },
      create: { roomId: room.id, userId: uid },
      update: {},
    });
  }
  return room;
}

export async function markCreatorRoomRead(userId: string, roomSlug: string) {
  const room = await prisma.chatRoom.findUnique({ where: { slug: roomSlug } });
  if (!room) return;
  await prisma.chatRoomMember.updateMany({
    where: { roomId: room.id, userId },
    data: { lastReadAt: new Date() },
  });
}

export async function canPostToCreatorRoom(
  userId: string,
  roomSlug: string,
  isAdmin: boolean,
): Promise<boolean> {
  if (!(await canAccessCreatorLounge(userId))) return false;
  if (roomSlug === CREATOR_ANNOUNCEMENTS_SLUG) return isAdmin;
  const member = await prisma.chatRoomMember.findFirst({
    where: { userId, room: { slug: roomSlug } },
  });
  return Boolean(member);
}
