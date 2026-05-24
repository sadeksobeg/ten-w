import { ChatRoomType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const CREATOR_ROOM_SLUG = "content-creators";
export const CONTENT_CREATOR_BADGE = "content_creator";

export async function userHasBadge(userId: string, badgeKey: string): Promise<boolean> {
  const row = await prisma.userBadge.findFirst({
    where: { userId, badge: { key: badgeKey } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function userEarnedBadgeKeys(userId: string): Promise<string[]> {
  const rows = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: { select: { key: true } } },
  });
  return rows.map((r) => r.badge.key);
}

export async function userHasContentCreatorBadge(userId: string): Promise<boolean> {
  return userHasBadge(userId, CONTENT_CREATOR_BADGE);
}

export async function ensureCreatorRoom() {
  let room = await prisma.chatRoom.findUnique({
    where: { slug: CREATOR_ROOM_SLUG },
  });
  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        slug: CREATOR_ROOM_SLUG,
        type: ChatRoomType.CREATOR,
        title: "Content Creators Circle",
        isPublic: false,
      },
    });
  }
  return room;
}

export async function userIsCreatorRoomMember(userId: string): Promise<boolean> {
  const room = await prisma.chatRoom.findUnique({
    where: { slug: CREATOR_ROOM_SLUG },
    select: { id: true },
  });
  if (!room) return false;
  const member = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId } },
  });
  return Boolean(member);
}

export async function addUserToCreatorRoom(userId: string) {
  const room = await ensureCreatorRoom();
  await prisma.chatRoomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId } },
    create: { roomId: room.id, userId },
    update: {},
  });
  return room;
}

export async function removeUserFromCreatorRoom(userId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { slug: CREATOR_ROOM_SLUG },
    select: { id: true },
  });
  if (!room) return;
  await prisma.chatRoomMember.deleteMany({
    where: { roomId: room.id, userId },
  });
}

export async function listCreatorRoomMembers() {
  const room = await prisma.chatRoom.findUnique({
    where: { slug: CREATOR_ROOM_SLUG },
    select: { id: true },
  });
  if (!room) return [];

  return prisma.chatRoomMember.findMany({
    where: { roomId: room.id },
    orderBy: { joinedAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          avatarPreset: true,
          publicSlug: true,
        },
      },
    },
  });
}

export async function listContentCreatorPartners() {
  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: CONTENT_CREATOR_BADGE },
    select: { id: true },
  });
  if (!badge) return [];

  return prisma.userBadge.findMany({
    where: { badgeId: badge.id },
    orderBy: { grantedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          publicSlug: true,
        },
      },
    },
  });
}
