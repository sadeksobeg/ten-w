import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AdminChatModeratorsClient } from "@/components/growth/admin/AdminChatModeratorsClient";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminChatModeratorsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/growth/sign-in`);
  }

  const partners = await prisma.user.findMany({
    where: { role: UserRole.PARTNER, partnerProfile: { isNot: null } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      chatModerator: true,
    },
  });

  const t = await getTranslations("Growth.admin.chatModerators");

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
        {t("pageTitle")}
      </h1>
      <AdminChatModeratorsClient
        partners={partners.map((p) => ({
          userId: p.id,
          name: p.name,
          email: p.email,
          avatarUrl: p.avatarUrl,
          chatModerator: p.chatModerator,
        }))}
      />
    </div>
  );
}
