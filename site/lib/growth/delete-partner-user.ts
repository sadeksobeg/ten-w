import { prisma } from "@/lib/prisma";

/** Permanently removes a partner user and clears blocking relations (admin-only caller). */
export async function deletePartnerUser(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.partnerProfile.updateMany({
      where: { parentUserId: userId },
      data: { parentUserId: null },
    });

    const deals = await tx.deal.findMany({
      where: { partnerId: userId },
      select: { id: true },
    });
    const dealIds = deals.map((d) => d.id);

    if (dealIds.length > 0) {
      await tx.commissionLedger.deleteMany({ where: { dealId: { in: dealIds } } });
      await tx.xpEvent.deleteMany({ where: { dealId: { in: dealIds } } });
      await tx.chatConversation.updateMany({
        where: { linkedDealId: { in: dealIds } },
        data: { linkedDealId: null },
      });
      await tx.deal.deleteMany({ where: { id: { in: dealIds } } });
    }

    await tx.commissionLedger.deleteMany({ where: { userId } });
    await tx.payoutRequest.deleteMany({ where: { userId } });
    await tx.hallOfLegend.deleteMany({
      where: { OR: [{ partnerId: userId }, { addedById: userId }] },
    });

    await tx.user.delete({ where: { id: userId } });
  });
}
