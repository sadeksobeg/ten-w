import { UserRole } from "@prisma/client";
import { auth } from "@/auth";

export async function requireInviteAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return null;
  }
  return session;
}
