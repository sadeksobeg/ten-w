import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { IconBattle } from "@/components/growth/icons/GrowthIcons";
import { getPartnerBattles, hasActiveBattle } from "@/lib/growth/battles";
import { BattleCard } from "@/components/growth/battles/BattleCard";
import { BattleChallengeForm } from "@/components/growth/battles/BattleChallengeForm";
import { getBattleChallengeCandidates } from "@/lib/growth/battle-candidates";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthBattlesPage({ params }: Props) {
  const { locale } = await params;
  const { userId } = await requirePartnerDashboard(locale);
  const t = await getTranslations("Growth.battles");

  const [battles, canChallenge, { groups }] = await Promise.all([
    getPartnerBattles(userId),
    hasActiveBattle(userId).then((v) => !v),
    getBattleChallengeCandidates(userId),
  ]);

  return (
    <div className="space-y-6">
      <GrowthPageHeader
        variant="feature"
        icon={<IconBattle size={28} />}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      {canChallenge ? <BattleChallengeForm groups={groups} locale={locale} /> : null}
      <div className="space-y-4">
        {battles.length === 0 ? (
          <p className="text-sm text-white/55">{t("empty")}</p>
        ) : (
          battles.map((b) => <BattleCard key={b.id} battle={b} myUserId={userId} />)
        )}
      </div>
    </div>
  );
}
