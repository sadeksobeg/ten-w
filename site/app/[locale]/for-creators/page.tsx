import { getTranslations } from "next-intl/server";
import { ForCreatorsLanding } from "@/components/for-creators/ForCreatorsLanding";
import { listCreatorDirectory } from "@/lib/growth/creator-arena";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Creators.public" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ForCreatorsPage({ params }: Props) {
  const { locale } = await params;
  let directory: Awaited<ReturnType<typeof listCreatorDirectory>> = [];
  try {
    directory = await listCreatorDirectory();
  } catch {
    /* build / offline — empty proof cards */
  }
  const topCreators = directory
    .filter((c) => c.submissions > 0)
    .slice(0, 3)
    .map((c) => ({
      name: c.name,
      submissions: c.submissions,
      cupRank: c.cupRank,
      levelCode: c.levelCode,
    }));

  return <ForCreatorsLanding locale={locale} topCreators={topCreators} />;
}
