import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function userCanModerateChat(userId: string, role: UserRole): Promise<boolean> {
  if (role === UserRole.ADMIN) return true;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { chatModerator: true },
  });
  return Boolean(user?.chatModerator);
}

export async function getChatModerationStatus(userId: string, role: UserRole) {
  return { canModerate: await userCanModerateChat(userId, role) };
}

export async function setChatModerator(userId: string, enabled: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { chatModerator: enabled },
  });
}

export async function assertRoomMessageInRoom(messageId: string, roomId: string) {
  const msg = await prisma.chatRoomMessage.findUnique({
    where: { id: messageId },
    select: { roomId: true, kind: true, deletedAt: true },
  });
  if (!msg || msg.roomId !== roomId) throw new Error("not_found");
  if (msg.kind === "SYSTEM") throw new Error("cannot_moderate_system");
  return msg;
}

export async function softDeleteRoomMessage(messageId: string, moderatorId: string) {
  return prisma.chatRoomMessage.update({
    where: { id: messageId },
    data: {
      deletedAt: new Date(),
      editedById: moderatorId,
      body: "",
    },
  });
}

export async function editRoomMessage(messageId: string, body: string, moderatorId: string) {
  return prisma.chatRoomMessage.update({
    where: { id: messageId },
    data: {
      body,
      editedAt: new Date(),
      editedById: moderatorId,
    },
  });
}
