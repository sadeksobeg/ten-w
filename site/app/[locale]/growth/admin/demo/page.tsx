import { CinematicDemoExperience } from "@/components/growth/admin/CinematicDemoExperience";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GrowthAdminDemoPage({ params }: Props) {
  const { locale } = await params;
  return <CinematicDemoExperience locale={locale} />;
}
