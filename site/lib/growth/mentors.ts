import { prisma } from "@/lib/prisma";

export async function grantMentorXpOnMenteeDeal(menteeUserId: string): Promise<void> {
  const session = await prisma.mentorshipSession.findFirst({
    where: { menteeId: menteeUserId, status: "ACTIVE" },
    include: { offer: true },
  });
  if (!session?.offer) return;

  const amount = session.offer.xpRewardPerMenteeDeal;
  await prisma.$transaction([
    prisma.partnerProfile.update({
      where: { userId: session.mentorId },
      data: { totalXp: { increment: amount } },
    }),
    prisma.xpEvent.create({
      data: {
        userId: session.mentorId,
        amount,
        reason: "mentee_deal_closed",
        source: "mentorship",
      },
    }),
  ]);
}

export async function countCompletedMentorships(mentorId: string): Promise<number> {
  return prisma.mentorshipSession.count({
    where: { mentorId, status: "COMPLETED" },
  });
}
