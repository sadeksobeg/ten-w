import type { NotificationType, Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createNotification(
  db: PrismaClient | Prisma.TransactionClient,
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<{ id: string } | null> {
  const c = db as unknown as {
    notification?: { create: (a: object) => Promise<{ id: string }> };
  };
  if (typeof c.notification?.create !== "function") {
    return null;
  }
  try {
    const row = await c.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link ?? null,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return { id: row.id };
  } catch {
    return null;
  }
}

export async function createNotificationsForAllActivePartners(params: {
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
  eventId?: string;
}): Promise<number> {
  const partners = await prisma.user.findMany({
    where: { role: UserRole.PARTNER, isActive: true },
    select: { id: true },
  });
  let count = 0;
  for (const p of partners) {
    const n = await createNotification(prisma, {
      userId: p.id,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: params.metadata,
    });
    if (n && params.eventId) {
      const ec = prisma as unknown as {
        eventNotification?: { create: (a: object) => Promise<unknown> };
      };
      if (typeof ec.eventNotification?.create === "function") {
        await ec.eventNotification.create({
          data: { eventId: params.eventId, notificationId: n.id },
        });
      }
    }
    if (n) count += 1;
  }
  return count;
}

export async function notifyAdmins(params: {
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN, isActive: true },
    select: { id: true },
  });
  for (const a of admins) {
    await createNotification(prisma, {
      userId: a.id,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: params.metadata,
    });
  }
}
