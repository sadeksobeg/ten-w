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
  if (partners.length === 0) return 0;

  const CHUNK = 150;
  let count = 0;
  try {
    for (let i = 0; i < partners.length; i += CHUNK) {
      const slice = partners.slice(i, i + CHUNK);
      const result = await prisma.notification.createMany({
        data: slice.map((p) => ({
          userId: p.id,
          type: params.type,
          title: params.title,
          body: params.body,
          link: params.link ?? null,
        })),
      });
      count += result.count;
    }
  } catch (err) {
    console.error("[notify] createMany partners", err);
    return 0;
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
