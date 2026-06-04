import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/growth/notify";
import { pickEngagementText } from "@/lib/growth/engagement-i18n";
import { syncVaultUnlocks } from "@/lib/growth/vault-unlock";
import { deliverMemoryEvents } from "@/lib/growth/memory";
import { generateWeeklyChronicleIfSunday } from "@/lib/growth/weekly-chronicle";
import { updateActiveBattleProgress } from "@/lib/growth/battles";
import { getCapsuleComparison } from "@/lib/growth/time-capsule";

export async function deliverTimeCapsuleIfDue(userId: string, locale: string): Promise<boolean> {
  const cap = await prisma.timeCapsule.findUnique({ where: { userId } });
  if (!cap || cap.wasDelivered || cap.openAt.getTime() > Date.now()) return false;

  const comparison = await getCapsuleComparison(userId);
  const goalsLine =
    comparison && locale === "ar"
      ? `أهدافك: ${comparison.goals.deals ?? "—"} صفقة · حققت ${comparison.actual.deals}`
      : comparison
        ? `Goals: ${comparison.goals.deals ?? "—"} deals · achieved ${comparison.actual.deals}`
        : "";

  await prisma.timeCapsule.update({
    where: { id: cap.id },
    data: { wasDelivered: true, openedAt: new Date() },
  });

  await createNotification(prisma, {
    userId,
    type: NotificationType.SYSTEM,
    title: pickEngagementText(locale, {
      ar: "رسالة من الماضي — قبل 6 أشهر",
      en: "A message from the past — 6 months ago",
      fr: "Un message du passé — il y a 6 mois",
    }),
    body: `${cap.message.slice(0, 200)}${goalsLine ? `\n${goalsLine}` : ""}`,
    link: "/growth",
    metadata: { kind: "time_capsule", capsuleId: cap.id },
  });

  return true;
}

export async function runPartnerEngagementHooks(userId: string, locale: string): Promise<void> {
  try {
    await deliverTimeCapsuleIfDue(userId, locale);
  } catch {
    /* optional tables */
  }
  try {
    await deliverMemoryEvents(userId, locale);
  } catch {
    /* ignore */
  }
  try {
    await syncVaultUnlocks(userId, locale);
  } catch {
    /* ignore */
  }
  try {
    await generateWeeklyChronicleIfSunday(userId, locale);
  } catch {
    /* ignore */
  }
  try {
    await updateActiveBattleProgress(userId, locale);
  } catch {
    /* ignore */
  }
}
