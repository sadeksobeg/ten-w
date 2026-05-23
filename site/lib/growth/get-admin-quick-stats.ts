import { DealStatus, PayoutStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminQuickStats = {
  partners: number;
  pendingDeals: number;
  pendingPayouts: number;
  openChats: number;
};

export async function getAdminQuickStats(): Promise<AdminQuickStats> {
  const [partners, pendingDeals, pendingPayouts, openChats] = await Promise.all([
    prisma.partnerProfile.count(),
    prisma.deal.count({ where: { status: DealStatus.PENDING } }),
    prisma.payoutRequest.count({ where: { status: PayoutStatus.PENDING } }),
    prisma.chatConversation.count({ where: { status: "OPEN" } }).catch(() => 0),
  ]);
  return { partners, pendingDeals, pendingPayouts, openChats };
}
