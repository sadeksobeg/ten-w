import { ChatRoomType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchChatKeywords } from "@/lib/growth/chat-keywords";

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
  body: string;
  kind: string;
  metadata: Record<string, unknown> | null;
  isOfficial: boolean;
  triggerKey: string | null;
  createdAt: string;
};

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
  return rows.map((m) => ({
    id: m.id,
    roomId: m.roomId,
    senderUserId: m.senderUserId,
    ...mapSender(m.sender),
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
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
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
  return {
    id: msg.id,
    roomId: msg.roomId,
    senderUserId: msg.senderUserId,
    ...mapSender(msg.sender),
    body: msg.body,
    kind: msg.kind,
    metadata: (msg.metadata as Record<string, unknown> | null) ?? null,
    isOfficial: msg.isOfficial,
    triggerKey: msg.triggerKey,
    createdAt: msg.createdAt.toISOString(),
  } satisfies ChatRoomMessageDTO;
}

export async function postCommunityMessage(senderUserId: string, body: string) {
  const room = await ensureCommunityMember(senderUserId);
  const user = await prisma.user.findUnique({
    where: { id: senderUserId },
    select: { isVerifiedOfficial: true, role: true },
  });
  const isOfficial = Boolean(user?.isVerifiedOfficial && user.role === "ADMIN");

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
