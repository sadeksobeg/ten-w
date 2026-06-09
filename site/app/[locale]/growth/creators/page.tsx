import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContentCreatorHub } from "@/components/growth/creators/ContentCreatorHub";
import {
  CREATOR_HUB_DEFERRED_DEFAULTS,
  loadCreatorHubEssentials,
} from "@/lib/growth/creator-hub-loader";
import { canAccessCreatorLounge } from "@/lib/growth/creator-program";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function ContentCreatorsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { preview } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN" && preview !== "lounge") {
    redirect(`/${locale}/growth/admin/creators`);
  }

  const userId = session.user.id;
  const hasAccess = await canAccessCreatorLounge(userId);
  if (!hasAccess) {
    redirect(`/${locale}/growth`);
  }

  const essentials = await loadCreatorHubEssentials(
    userId,
    locale,
    session.user.email ?? "",
    session.user.name,
  );

  return (
    <div className="growth-creator-hub-page growth-page-enter">
      <ContentCreatorHub
        {...CREATOR_HUB_DEFERRED_DEFAULTS}
        {...essentials}
        deferredLoading
      />
    </div>
  );
}
