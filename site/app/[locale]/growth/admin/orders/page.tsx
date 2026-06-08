import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminClientOrdersClient } from "@/components/growth/admin/AdminClientOrdersClient";
import {
  getAdminOrderStats,
  listAdminClientOrders,
} from "@/lib/growth/client-order-admin";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthAdminOrdersPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect(`/${locale}/growth/sign-in`);
  }

  const [orders, stats] = await Promise.all([
    listAdminClientOrders(),
    getAdminOrderStats(),
  ]);

  return <AdminClientOrdersClient orders={orders} stats={stats} />;
}
