import { getTranslations } from "next-intl/server";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";
import { GrowthPageHeader } from "@/components/growth/GrowthPageHeader";
import { VaultItemCard, type VaultItemView } from "@/components/growth/vault/VaultItemCard";
import { prisma } from "@/lib/prisma";
import {
  evaluateCriteria,
  getPartnerVaultStats,
  parseUnlockCriteria,
  countVaultUnlocks,
} from "@/lib/growth/vault-unlock";
import type { UnlockCriteria } from "@/lib/growth/vault-unlock";

type Props = { params: Promise<{ locale: string }> };

function criteriaLabel(criteria: UnlockCriteria | null, locale: string): string {
  if (!criteria) return "";
  if (criteria.type === "hall_member") {
    return locale === "ar" ? "عضو قاعة الأساطير" : "Hall of Legends member";
  }
  if (criteria.type === "level_code") {
    return locale === "ar" ? `مستوى ${criteria.value}` : `Level ${criteria.value}`;
  }
  if (criteria.type === "direct_referrals") {
    return locale === "ar" ? `${criteria.value} شريك مباشر` : `${criteria.value} direct partners`;
  }
  const labels: Record<string, string> = {
    deals: locale === "ar" ? "صفقات مغلقة" : "closed deals",
    xp: "XP",
    streak: locale === "ar" ? "سلسلة أيام" : "day streak",
    revenue_cents: locale === "ar" ? "أرباح" : "earnings",
    badge_key: locale === "ar" ? "شارة" : "badge",
  };
  return `${criteria.value} ${labels[criteria.type] ?? criteria.type}`;
}

export default async function GrowthVaultPage({ params }: Props) {
  const { locale } = await params;
  const { userId } = await requirePartnerDashboard(locale);
  const t = await getTranslations("Growth.vault");

  const [items, stats, unlocks] = await Promise.all([
    prisma.vaultItem.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    getPartnerVaultStats(userId),
    prisma.userVaultUnlock.findMany({ where: { userId }, select: { vaultItemId: true } }),
  ]);
  const unlockedSet = new Set(unlocks.map((u) => u.vaultItemId));
  const unlockedCount = await countVaultUnlocks(userId);

  const views: VaultItemView[] = items.map((item) => {
    const criteria = parseUnlockCriteria(item.unlockCriteria);
    const unlocked = unlockedSet.has(item.id);
    const progress = criteria ? evaluateCriteria(criteria, stats) : { current: 0, target: 1, met: false };
    const isAr = locale === "ar";
    return {
      id: item.id,
      slug: item.slug,
      title: isAr ? item.titleAr : item.titleEn,
      desc: isAr ? item.descAr : item.descEn,
      preview: isAr ? item.previewAr : item.previewEn,
      content: isAr ? item.contentAr : item.contentEn,
      icon: item.icon,
      unlocked,
      progress,
      criteriaLabel: criteriaLabel(criteria, locale),
    };
  });

  return (
    <div className="space-y-6">
      <GrowthPageHeader
        title={t("title")}
        subtitle={t("subtitle", { unlocked: unlockedCount, total: items.length })}
      />
      <div className="space-y-4">
        {views.map((item) => (
          <VaultItemCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </div>
  );
}
