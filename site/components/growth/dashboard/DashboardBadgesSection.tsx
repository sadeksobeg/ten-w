import { getTranslations } from "next-intl/server";
import { BadgeGrid } from "@/components/growth/badges/BadgeGrid";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import type { DashboardBadge } from "@/lib/growth/get-dashboard";
import { evaluateBadgeProgressMap } from "@/lib/growth/badge-progress";

type Props = {
  locale: string;
  badges: DashboardBadge[];
  userId?: string;
  compact?: boolean;
};

export async function DashboardBadgesSection({ locale, badges, userId, compact }: Props) {
  const t = await getTranslations("Growth.badges");
  const earned = badges.filter((b) => b.earned).length;
  const lockedKeys = badges.filter((b) => !b.earned).map((b) => b.key);
  const progressMap =
    userId && lockedKeys.length > 0
      ? await evaluateBadgeProgressMap(lockedKeys, userId)
      : {};

  const grid = (
    <BadgeGrid
      locale={locale}
      badges={badges.map((b) => ({
        key: b.key,
        name: b.name,
        description: b.description ?? undefined,
        howTo: b.howTo,
        earned: b.earned,
        grantedAt: b.grantedAt,
        hidden: b.hidden,
        progress: progressMap[b.key] ?? null,
      }))}
      size="md"
    />
  );

  if (compact) {
    return badges.length === 0 ? (
      <EmptyState illustration="trophy" message={t("empty")} />
    ) : (
      grid
    );
  }

  return (
    <section>
      <SectionHeader title={t("title")} subtitle={`${earned} / ${badges.length}`} />
      <GlassCard className="mt-4">
        {badges.length === 0 ? (
          <EmptyState illustration="trophy" message={t("empty")} />
        ) : (
          grid
        )}
      </GlassCard>
    </section>
  );
}
