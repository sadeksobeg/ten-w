import { GrowthNetworkView } from "@/components/growth/GrowthNetworkView";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthNetworkPage({ params }: Props) {
  const { locale } = await params;
  const { data, session } = await requirePartnerDashboard(locale);
  return (
    <GrowthNetworkView locale={locale} data={data} userId={session.user.id} />
  );
}
