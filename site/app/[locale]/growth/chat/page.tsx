import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GrowthPartnerChatHub } from "@/components/growth/chat/GrowthPartnerChatHub";
import { ensureOpenConversation } from "@/lib/growth/chat-service";
import { prisma } from "@/lib/prisma";

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
  const [conv, user] = await Promise.all([
    ensureOpenConversation(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
  ]);
  const t = await getTranslations("Growth");

  return (
    <div className="space-y-6 growth-page-enter">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">
          {t("chat.nav")}
        </h1>
        <Link
          href={`/${locale}/growth`}
          className="text-xs font-semibold text-white/55 hover:text-white"
        >
          {t("chat.back")}
        </Link>
      </div>
      <GlassCard className="overflow-hidden border border-white/12 bg-white/[0.03] p-0">
        <GrowthPartnerChatHub
          locale={locale}
          viewerUserId={session.user.id}
          viewerEmail={user?.email ?? session.user.email ?? ""}
          viewerName={user?.name ?? session.user.name ?? null}
          supportConversationId={conv.id}
        />
      </GlassCard>
    </div>
  );
}
