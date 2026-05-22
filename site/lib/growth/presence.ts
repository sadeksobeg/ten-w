import type { PrismaClient } from "@prisma/client";

/** Consider user online if active within this window. */
export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

type Db = Pick<PrismaClient, "user">;

export async function touchLastSeen(db: Db, userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date() },
  });
}

export function isUserOnline(lastSeenAt: Date | string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const t = typeof lastSeenAt === "string" ? new Date(lastSeenAt).getTime() : lastSeenAt.getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < ONLINE_WINDOW_MS;
}

export type PresenceSnapshot = {
  lastSeenAt: string | null;
  isOnline: boolean;
};

export function presenceFromUser(user: {
  lastSeenAt: Date | null;
}): PresenceSnapshot {
  const lastSeenAt = user.lastSeenAt?.toISOString() ?? null;
  return {
    lastSeenAt,
    isOnline: isUserOnline(user.lastSeenAt),
  };
}

export function formatLastSeenLabel(
  lastSeenAt: Date | string | null | undefined,
  locale: string,
  labels: { online: string; justNow: string; minutesAgo: (n: number) => string; lastSeen: (when: string) => string },
): string {
  if (isUserOnline(lastSeenAt)) return labels.online;
  if (!lastSeenAt) return labels.justNow;
  const d = typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
  if (Number.isNaN(d.getTime())) return labels.justNow;
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return labels.justNow;
  if (diffMin < 60) return labels.minutesAgo(diffMin);
  const nf = locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const when = new Intl.DateTimeFormat(nf, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return labels.lastSeen(when);
}
