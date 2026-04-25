import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GrowthAdminChatClient } from "@/components/growth/chat/GrowthAdminChatClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GrowthAdminChatPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/growth`);
  }
  const t = await getTranslations("Growth.chat.admin");

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("pageTitle")}
      </h1>
      <GrowthAdminChatClient locale={locale} adminUserId={session.user.id} />
    </div>
  );
}
