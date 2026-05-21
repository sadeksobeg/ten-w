import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function GrowthAdminAuditPage() {
  const t = await getTranslations("Growth.admin.auditPage");
  let logs: {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    createdAt: Date;
    actor: { email: string; name: string | null };
  }[] = [];
  try {
    logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { email: true, name: true } } },
    });
  } catch {
    logs = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>
      <p className="text-sm text-white/65">{t("hint")}</p>
      <ul className="space-y-2">
        {logs.length === 0 ? (
          <li className="text-sm text-white/50">{t("empty")}</li>
        ) : (
          logs.map((l) => (
            <li key={l.id} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
              <span className="font-semibold text-gold">{l.action}</span>{" "}
              <span className="text-white/60">
                {l.entity}
                {l.entityId ? ` · ${l.entityId}` : ""}
              </span>
              <div className="mt-1 text-xs text-white/45">
                {l.actor.name ?? l.actor.email} · {l.createdAt.toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
