import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GrowthAdminChatClient } from "@/components/growth/chat/GrowthAdminChatClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversationId?: string; partnerUserId?: string }>;
};

export default async function GrowthAdminChatPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/growth`);
  }
  const t = await getTranslations("Growth.chat.admin");

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
        {t("pageTitle")}
      </h1>
      <p className="max-w-2xl text-sm text-white/50">{t("pageSubtitle")}</p>
      <GrowthAdminChatClient
        locale={locale}
        adminUserId={session.user.id}
        adminEmail={session.user.email ?? ""}
        adminName={session.user.name ?? null}
        initialConversationId={sp.conversationId ?? null}
        initialPartnerUserId={sp.partnerUserId ?? null}
      />
    </div>
  );
}
