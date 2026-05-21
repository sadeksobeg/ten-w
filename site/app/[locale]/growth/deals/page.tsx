import { GrowthDealsView } from "@/components/growth/GrowthDealsView";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthDealsPage({ params }: Props) {
  const { locale } = await params;
  const { data } = await requirePartnerDashboard(locale);
  return <GrowthDealsView locale={locale} data={data} />;
}
