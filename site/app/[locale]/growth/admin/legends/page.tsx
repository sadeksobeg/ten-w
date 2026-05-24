import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listHallOfLegends } from "@/lib/growth/hall-of-legends";
import { AdminHallLegendsClient } from "@/components/growth/admin/AdminHallLegendsClient";
import { resolveChatSenderName } from "@/lib/growth/chat-display";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminLegendsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/growth/sign-in`);
  if (session.user.role !== "ADMIN") redirect(`/${locale}/growth`);

  const [entries, partners, t] = await Promise.all([
    listHallOfLegends(),
    prisma.user.findMany({
      where: { role: "PARTNER", isActive: true, partnerProfile: { isNot: null } },
      select: {
        id: true,
        name: true,
        email: true,
        isVerifiedOfficial: true,
        officialDisplayName: true,
      },
      orderBy: { name: "asc" },
      take: 200,
    }),
    getTranslations("Growth.admin.legends"),
  ]);

  const inHall = new Set(entries.map((e) => e.partner.userId));
  const partnerOptions = partners
    .filter((p) => !inHall.has(p.id))
    .map((p) => ({
      userId: p.id,
      label: `${resolveChatSenderName(p)} (${p.email})`,
    }));

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("pageTitle")}</h1>
      <p className="text-sm text-white/55">{t("hint")}</p>
      <p className="text-xs text-gold">{t("count", { count: entries.length })}</p>
      <AdminHallLegendsClient locale={locale} partners={partnerOptions} />
    </div>
  );
}
