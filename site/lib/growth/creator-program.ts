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

/** Lounge access: content_creator badge OR admin-granted room membership. Does not alter partner profile/XP. */
export async function canAccessCreatorLounge(userId: string): Promise<boolean> {
  const [hasBadge, inRoom] = await Promise.all([
    userHasContentCreatorBadge(userId),
    userIsCreatorRoomMember(userId),
  ]);
  return hasBadge || inRoom;
}

export function isCreatorProgramInvite(tier: string): boolean {
  const t = tier.toUpperCase();
  return t.includes("CREATOR") || t.includes("CONTENT") || tier.includes("صانع");
}

export async function grantCreatorLoungeAccess(
  userId: string,
  opts?: { notify?: boolean },
) {
  const { ensureCreatorArenaProfile } = await import("@/lib/growth/creator-arena");
  const { CreatorWorkflowStatus, NotificationType } = await import("@prisma/client");
  const { createNotification } = await import("@/lib/growth/notify");
  const { prisma } = await import("@/lib/prisma");

  await addUserToCreatorRoom(userId);
  await ensureCreatorArenaProfile(userId, CreatorWorkflowStatus.JOINED);

  if (opts?.notify !== false) {
    await createNotification(prisma, {
      userId,
      type: NotificationType.SYSTEM,
      title: "Creator Arena",
      body: "تم منحك وصول غرفة صنّاع المحتوى — استكشف التحديات والموارد.",
      link: "/growth/creators",
      metadata: { kind: "creator_lounge_granted" },
    });
  }
}

/** Badge holders + admin-granted lounge members (for cup / battles scope). */
export async function getCreatorLoungeParticipantIds(): Promise<string[]> {
  const badge = await prisma.badgeDefinition.findUnique({
    where: { key: CONTENT_CREATOR_BADGE },
    select: { id: true },
  });
  const badgeIds = badge
    ? (
        await prisma.userBadge.findMany({
          where: { badgeId: badge.id },
          select: { userId: true },
        })
      ).map((r) => r.userId)
    : [];

  const room = await prisma.chatRoom.findUnique({
    where: { slug: CREATOR_ROOM_SLUG },
    select: { id: true },
  });
  const roomIds = room
    ? (
        await prisma.chatRoomMember.findMany({
          where: { roomId: room.id },
          select: { userId: true },
        })
      ).map((m) => m.userId)
    : [];

  return [...new Set([...badgeIds, ...roomIds])];
}

export async function revokeCreatorLoungeAccess(userId: string): Promise<"ok" | "badge_protected"> {
  if (await userHasContentCreatorBadge(userId)) {
    return "badge_protected";
  }
  await removeUserFromCreatorRoom(userId);
  return "ok";
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
