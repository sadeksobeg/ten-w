import { getTranslations } from "next-intl/server";
import { InviteAdminPanel } from "@/components/growth/admin/InviteAdminPanel";
import { getInviteStats, listInviteCards } from "@/lib/invite/get-card";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Growth.admin.invites" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function GrowthAdminInvitesPage() {
  const [cards, stats] = await Promise.all([listInviteCards(), getInviteStats()]);
  const origin = getSiteUrl().origin;

  return <InviteAdminPanel cards={cards} stats={stats} origin={origin} />;
}
