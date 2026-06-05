import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { InviteAdminDashboard } from "@/components/invite/admin/InviteAdminDashboard";
import { getInviteStats, listInviteCards } from "@/lib/invite/get-card";
import { getSiteUrl } from "@/lib/site";

export const metadata = {
  title: "Invite Admin — TENEGTA",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    redirect("/admin/login");
  }

  const [cards, stats] = await Promise.all([listInviteCards(), getInviteStats()]);
  const origin = getSiteUrl().origin;

  return <InviteAdminDashboard cards={cards} stats={stats} origin={origin} />;
}
