import { GrowthEarningsView } from "@/components/growth/GrowthEarningsView";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthEarningsPage({ params }: Props) {
  const { locale } = await params;
  const { data } = await requirePartnerDashboard(locale);
  return <GrowthEarningsView locale={locale} data={data} />;
}
