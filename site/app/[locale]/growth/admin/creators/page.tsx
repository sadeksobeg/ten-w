import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import {
  AdminCreatorGroupClient,
  type CreatorAdminPartner,
} from "@/components/growth/admin/AdminCreatorGroupClient";
import {
  ensureCreatorRoom,
  listContentCreatorPartners,
  listCreatorRoomMembers,
} from "@/lib/growth/creator-program";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminCreatorsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    redirect(`/${locale}/growth/sign-in`);
  }

  await ensureCreatorRoom();

  const [allPartners, badgeRows, roomMembers] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.PARTNER, partnerProfile: { isNot: null } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        creatorArenaProfile: { select: { status: true } },
      },
    }),
    listContentCreatorPartners(),
    listCreatorRoomMembers(),
  ]);

  const badgeMap = new Map(
    badgeRows.map((r) => [
      r.user.id,
      { grantedAt: r.grantedAt.toISOString() },
    ]),
  );
  const roomSet = new Set(roomMembers.map((m) => m.userId));

  const partners: CreatorAdminPartner[] = allPartners.map((u) => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    hasBadge: badgeMap.has(u.id),
    inRoom: roomSet.has(u.id),
    hasLoungeAccess: badgeMap.has(u.id) || roomSet.has(u.id),
    badgeGrantedAt: badgeMap.get(u.id)?.grantedAt ?? null,
    workflowStatus: u.creatorArenaProfile?.status ?? null,
  }));

  return (
    <div className="space-y-6 growth-page-enter">
      <AdminCreatorGroupClient partners={partners} />
    </div>
  );
}
