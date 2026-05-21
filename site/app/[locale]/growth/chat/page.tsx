import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import { GrowthChatThread } from "@/components/growth/chat/GrowthChatThread";
import { ensureOpenConversation } from "@/lib/growth/chat-service";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GrowthPartnerChatPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/growth/admin/chat`);
  }
  const conv = await ensureOpenConversation(session.user.id);
  const t = await getTranslations("Growth");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          {t("chat.nav")}
        </h1>
        <Link
          href={`/${locale}/growth`}
          className="text-xs font-semibold text-white/55 hover:text-white"
        >
          {t("chat.back")}
        </Link>
      </div>
      <GlassCard className="overflow-hidden border border-white/12 bg-white/[0.03] p-0 sm:p-0">
        <div className="h-[min(72vh,640px)]">
          <GrowthChatThread
            conversationId={conv.id}
            viewerUserId={session.user.id}
            isAdmin={false}
            locale={locale}
            embedded
            className="h-full"
          />
        </div>
      </GlassCard>
    </div>
  );
}
