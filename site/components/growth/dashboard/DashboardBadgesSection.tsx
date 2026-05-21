import { BadgeGrid } from "@/components/growth/badges/BadgeGrid";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { SectionHeader } from "@/components/growth/ui/SectionHeader";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import type { DashboardBadge } from "@/lib/growth/get-dashboard";

type Props = {
  locale: string;
  badges: DashboardBadge[];
};

export function DashboardBadgesSection({ locale, badges }: Props) {
  const earned = badges.filter((b) => b.earned).length;
  const title = locale === "ar" ? "مجموعة الشارات" : "Badge collection";

  return (
    <section>
      <SectionHeader title={title} subtitle={`${earned} / ${badges.length}`} />
      <GlassCard className="mt-4">
        {badges.length === 0 ? (
          <EmptyState
            illustration="trophy"
            message={
              locale === "ar"
                ? "أنجز مهامك واكسب شاراتك الأولى"
                : "Complete missions to earn your first badges"
            }
          />
        ) : (
          <BadgeGrid
            badges={badges.map((b) => ({
              key: b.key,
              name: b.name,
              description: b.description ?? undefined,
              earned: b.earned,
              grantedAt: b.grantedAt,
              hidden: b.hidden,
            }))}
            size="md"
          />
        )}
      </GlassCard>
    </section>
  );
}
