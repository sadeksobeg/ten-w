import { getTranslations } from "next-intl/server";
import { AdminAuditClient } from "@/components/growth/admin/AdminAuditClient";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminAuditPage() {
  const t = await getTranslations("Growth.admin.auditPage");

  const [adminRows, activityRows] = await Promise.all([
    prisma.adminAuditLog
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 120,
        include: { actor: { select: { email: true, name: true } } },
      })
      .catch(() => []),
    prisma.activityEvent
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      .catch(() => []),
  ]);

  const actorIds = [
    ...new Set(activityRows.map((e) => e.actorUserId).filter((id): id is string => Boolean(id))),
  ];
  const actors =
    actorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, email: true, name: true },
        })
      : [];
  const actorMap = new Map(actors.map((u) => [u.id, u]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 text-sm text-white/65">{t("hint")}</p>
      </div>
      <AdminAuditClient
        adminLogs={adminRows.map((l) => ({
          id: l.id,
          action: l.action,
          entity: l.entity,
          entityId: l.entityId,
          createdAt: l.createdAt.toISOString(),
          actorEmail: l.actor.email,
          actorName: l.actor.name,
        }))}
        partnerActivity={activityRows.map((e) => {
          const actor = e.actorUserId ? actorMap.get(e.actorUserId) : null;
          return {
            id: e.id,
            kind: e.kind,
            headline: e.headline,
            createdAt: e.createdAt.toISOString(),
            actorUserId: e.actorUserId,
            actorEmail: actor?.email ?? null,
            actorName: actor?.name ?? null,
          };
        })}
      />
    </div>
  );
}
