import { prisma } from "@/lib/prisma";
import { logActivityEvent } from "@/lib/growth/activity";

export async function logPartnerSignIn(userId: string, email: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date() },
  });

  await logActivityEvent(prisma, {
    kind: "partner_sign_in",
    actorUserId: userId,
    headline: `تسجيل دخول: ${email}`,
    metadata: { email },
  });
}

export async function logPartnerPageView(userId: string, path: string) {
  await logActivityEvent(prisma, {
    kind: "partner_page_view",
    actorUserId: userId,
    headline: path,
    metadata: { path },
  });
}
