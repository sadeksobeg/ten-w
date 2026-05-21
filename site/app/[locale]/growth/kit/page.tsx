import { GrowthKitView } from "@/components/growth/GrowthKitView";
import { requirePartnerDashboard } from "@/lib/growth/partner-page";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthKitPage({ params }: Props) {
  const { locale } = await params;
  const { data } = await requirePartnerDashboard(locale);
  return <GrowthKitView locale={locale} data={data} />;
}
