import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NotificationsHub } from "@/components/growth/notifications/NotificationsHub";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthNotificationsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/growth/sign-in`);
  if (session.user.role === "ADMIN") redirect(`/${locale}/growth/admin`);

  const rows = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <NotificationsHub
      locale={locale}
      initial={rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        link: r.link,
        isRead: r.isRead,
        createdAt: r.createdAt.toISOString(),
        type: r.type,
      }))}
    />
  );
}
