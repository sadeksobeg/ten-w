"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";

export type AdminAuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  actorEmail: string;
  actorName: string | null;
};

export type PartnerActivityRow = {
  id: string;
  kind: string;
  headline: string;
  createdAt: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actorName: string | null;
};

type Props = {
  adminLogs: AdminAuditRow[];
  partnerActivity: PartnerActivityRow[];
};

type Tab = "admin" | "partners";

const PARTNER_KIND_LABELS: Record<string, string> = {
  partner_sign_in: "تسجيل دخول",
  partner_page_view: "تصفح صفحة",
};

export function AdminAuditClient({ adminLogs, partnerActivity }: Props) {
  const t = useTranslations("Growth.admin.auditPage");
  const [tab, setTab] = useState<Tab>("partners");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const filteredAdmin = useMemo(() => {
    if (!q) return adminLogs;
    return adminLogs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.actorEmail.toLowerCase().includes(q) ||
        (l.actorName?.toLowerCase().includes(q) ?? false),
    );
  }, [adminLogs, q]);

  const filteredPartners = useMemo(() => {
    if (!q) return partnerActivity;
    return partnerActivity.filter(
      (l) =>
        l.headline.toLowerCase().includes(q) ||
        l.kind.toLowerCase().includes(q) ||
        (l.actorEmail?.toLowerCase().includes(q) ?? false) ||
        (l.actorName?.toLowerCase().includes(q) ?? false),
    );
  }, [partnerActivity, q]);

  const tabClass = (active: boolean) =>
    `rounded-lg px-4 py-2 text-xs font-bold transition ${
      active ? "bg-gold/20 text-gold" : "text-white/55 hover:bg-white/[0.04]"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass(tab === "partners")} onClick={() => setTab("partners")}>
          {t("tabPartners")} ({partnerActivity.length})
        </button>
        <button type="button" className={tabClass(tab === "admin")} onClick={() => setTab("admin")}>
          {t("tabAdmin")} ({adminLogs.length})
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold/40 focus:outline-none"
      />

      <GlassCard className="max-h-[min(70vh,640px)] overflow-y-auto p-0">
        {tab === "partners" ? (
          <ul className="divide-y divide-white/10">
            {filteredPartners.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-white/50">{t("emptyPartners")}</li>
            ) : (
              filteredPartners.map((l) => (
                <li key={l.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                      {PARTNER_KIND_LABELS[l.kind] ?? l.kind}
                    </span>
                    <time className="text-[10px] text-white/40">
                      {new Date(l.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 font-medium text-white/90">{l.headline}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {l.actorName ?? l.actorEmail ?? t("unknownActor")}
                  </p>
                </li>
              ))
            )}
          </ul>
        ) : (
          <ul className="divide-y divide-white/10">
            {filteredAdmin.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-white/50">{t("empty")}</li>
            ) : (
              filteredAdmin.map((l) => (
                <li key={l.id} className="px-4 py-3 text-sm">
                  <span className="font-semibold text-gold">{l.action}</span>{" "}
                  <span className="text-white/60">
                    {l.entity}
                    {l.entityId ? ` · ${l.entityId}` : ""}
                  </span>
                  <div className="mt-1 text-xs text-white/45">
                    {l.actorName ?? l.actorEmail} · {new Date(l.createdAt).toLocaleString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
