import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPartnerDashboard } from "@/lib/growth/get-dashboard";
import { touchActivityDay, touchPartnerStreak } from "@/lib/growth/streak";
import { runPartnerEngagementHooks } from "@/lib/growth/engagement-hooks";

export async function requirePartnerDashboard(locale: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/growth/admin`);
  }

  await touchPartnerStreak(session.user.id);
  await touchActivityDay(session.user.id);
  await runPartnerEngagementHooks(session.user.id, locale);

  const data = await getPartnerDashboard(session.user.id, locale);

  return {
    session,
    data,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Partner",
    userEmail: session.user.email ?? "",
  };
}
