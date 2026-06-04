import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { buildConstellationStars, constellationNameFromArchetype } from "@/lib/growth/constellation";
import { StarMap } from "@/components/growth/constellation/StarMap";
import { getPartnerRival } from "@/lib/growth/rival";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthConstellationPage({ params }: Props) {
  const { locale } = await params;
  const { userId } = await requirePartnerDashboard(locale);
  const t = await getTranslations("Growth.constellation");

  const rival = await getPartnerRival(userId);
  const rivalId = rival?.rival.userId ?? null;
  const { stars, localeArchetype } = await buildConstellationStars(userId, rivalId);

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: { territory: true },
  });
  const name = constellationNameFromArchetype(localeArchetype, profile?.territory, locale);
  const starCount = stars.filter((s) => s.name).length;

  return (
    <div className="space-y-6">
      <GrowthPageHeader
        title={t("title")}
        subtitle={t("name", { name })}
      />
      <p className="text-center text-sm text-white/55">{t("stars", { n: starCount })}</p>
      <StarMap stars={stars} locale={locale} />
    </div>
  );
}
