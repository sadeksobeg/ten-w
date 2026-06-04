import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { IconMentor } from "@/components/growth/icons/GrowthIcons";
import { MentorMarketClient, type MentorOfferView, type MentorshipRow } from "@/components/growth/mentors/MentorMarketClient";
import { prisma } from "@/lib/prisma";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthMentorsPage({ params }: Props) {
  const { locale } = await params;
  const { userId } = await requirePartnerDashboard(locale);
  const t = await getTranslations("Growth.mentors");

  const [profile, myOffer] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId },
      include: { currentLevel: true },
    }),
    prisma.mentorOffer.findUnique({ where: { mentorId: userId } }),
  ]);

  const offersRaw = await prisma.mentorOffer.findMany({
    where: { isActive: true },
    include: {
      mentor: {
        select: { id: true, name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true },
      },
      sessions: { where: { status: { in: ["REQUESTED", "ACTIVE"] } } },
    },
  });

  const isAr = locale === "ar";
  const offers: MentorOfferView[] = offersRaw.map((o) => ({
    id: o.id,
    mentorId: o.mentorId,
    mentorName: resolveChatSenderName(o.mentor),
    specialty: isAr ? o.specialtyAr : o.specialtyEn,
    duration: o.duration,
    slotsLeft: Math.max(0, o.maxMentees - o.sessions.length),
  }));

  const sessionsRaw = await prisma.mentorshipSession.findMany({
    where: {
      OR: [{ mentorId: userId }, { menteeId: userId }],
      status: { notIn: ["DECLINED"] },
    },
    include: {
      mentor: { select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } },
      mentee: { select: { name: true, email: true, isVerifiedOfficial: true, officialDisplayName: true } },
    },
    orderBy: { requestedAt: "desc" },
    take: 20,
  });

  const sessions: MentorshipRow[] = sessionsRaw.map((s) => ({
    id: s.id,
    status: s.status,
    mentorName: resolveChatSenderName(s.mentor),
    menteeName: resolveChatSenderName(s.mentee),
    isMentor: s.mentorId === userId,
  }));

  return (
    <div className="space-y-6">
      <GrowthPageHeader
        variant="feature"
        icon={<IconMentor size={28} />}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <MentorMarketClient
        offers={offers}
        myOffer={Boolean(myOffer)}
        canOffer={(profile?.currentLevel.order ?? 0) >= 5}
        sessions={sessions}
        myUserId={userId}
      />
    </div>
  );
}
