import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logAdminAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Prisma.InputJsonValue,
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId: entityId ?? null,
        metadata: metadata ?? undefined,
      },
    });
  } catch {
    /* table may be missing before migrate */
  }
}
