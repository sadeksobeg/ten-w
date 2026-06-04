import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPartnerBattles } from "@/lib/growth/battles";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = { userId: string };

export async function BattleSidebar({ userId }: Props) {
  const t = await getTranslations("Growth.battles");
  const battles = await getPartnerBattles(userId);
  const active = battles.find((b) => b.status === "ACTIVE" || b.status === "PENDING");
  if (!active) return null;

  const opponent = active.isChallenger ? active.challenged : active.challenger;

  return (
    <GlassCard className="border-rose-500/30 bg-rose-500/5 p-4">
      <p className="text-xs font-bold text-rose-200">
        {active.status === "PENDING" ? t("incoming") : t("active")}
      </p>
      <p className="mt-1 text-sm text-white/80">{opponent.name}</p>
      <Link href="/growth/battles" className="mt-3 inline-block text-xs font-semibold text-gold hover:underline">
        {t("title")} →
      </Link>
    </GlassCard>
  );
}
