import { prisma } from "@/lib/prisma";

export async function getConversationForUser(input: {
  conversationId: string;
  userId: string;
  role: "ADMIN" | "PARTNER";
}) {
  const row = await prisma.chatConversation.findUnique({
    where: { id: input.conversationId },
    select: { id: true, partnerUserId: true, status: true, linkedDealId: true, priority: true },
  });
  if (!row) return null;
  if (input.role === "ADMIN") return row;
  if (row.partnerUserId !== input.userId) return null;
  return row;
}
