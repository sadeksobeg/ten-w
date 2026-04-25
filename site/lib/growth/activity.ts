import type { Prisma, PrismaClient } from "@prisma/client";
import { growthPrismaModelsAvailable } from "@/lib/growth/prisma-optional";

export async function logActivityEvent(
  prisma: PrismaClient,
  input: {
    kind: string;
    actorUserId?: string | null;
    headline: string;
    amountCents?: number | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  if (!growthPrismaModelsAvailable(prisma)) {
    return;
  }
  await prisma.activityEvent.create({
    data: {
      kind: input.kind,
      actorUserId: input.actorUserId ?? null,
      headline: input.headline,
      amountCents: input.amountCents ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
