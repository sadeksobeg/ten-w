import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Maps JWT/session to a live ADMIN row (handles stale token.sub after DB re-seed). */
export async function resolveAdminUserId(
  actorUserId: string,
  actorEmail?: string | null,
): Promise<string | null> {
  const id = actorUserId.trim();
  if (id) {
    const byId = await prisma.user.findFirst({
      where: { id, role: UserRole.ADMIN },
      select: { id: true },
    });
    if (byId) return byId.id;
  }

  const email = actorEmail?.toLowerCase().trim();
  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (byEmail?.role === UserRole.ADMIN) return byEmail.id;
  }

  return null;
}
