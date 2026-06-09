"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { CreatorWorkflowStatus } from "@prisma/client";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconShield } from "@/components/growth/icons/GrowthIcons";
import { CreatorConsentVerifiedBadge } from "@/components/growth/creators/CreatorConsentVerifiedBadge";
import type { CreatorAdminPartner } from "./creator-admin-types";

const WORKFLOW_STATUSES: CreatorWorkflowStatus[] = [
  "INVITED",
  "JOINED",
  "FILMING",
  "SUBMITTED",
  "FEATURED",
];

type StatusFilter = "all" | CreatorWorkflowStatus | "no_status";
type SortKey = "name" | "submissions" | "cupScore" | "status";

type Props = {
  partners: CreatorAdminPartner[];
  selectedId: string | null;
  onSelect: (partner: CreatorAdminPartner) => void;
  onGrantLounge: (userId: string) => void;
  onRevokeLounge: (userId: string) => void;
  pendingId: string | null;
};

export function AdminCreatorList({
  partners,
  selectedId,
  onSelect,
  onGrantLounge,
  onRevokeLounge,
  pendingId,
}: Props) {
  const t = useTranslations("Growth.creators.admin.list");
  const tPage = useTranslations("Growth.admin.creatorsPage");
  const tConsent = useTranslations("Creators.consent");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = partners.filter((p) => {
      if (q) {
        const match =
          p.email.toLowerCase().includes(q) ||
          (p.name?.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      if (statusFilter === "all") return true;
      if (statusFilter === "no_status") return !p.workflowStatus;
      return p.workflowStatus === statusFilter;
    });

    rows = [...rows].sort((a, b) => {
      if (sortKey === "name") {
        const an = (a.name ?? a.email).toLowerCase();
        const bn = (b.name ?? b.email).toLowerCase();
        return an.localeCompare(bn);
      }
      if (sortKey === "submissions") return b.totalSubmissions - a.totalSubmissions;
      if (sortKey === "cupScore") return b.cupScore - a.cupScore;
      const as = a.workflowStatus ?? "";
      const bs = b.workflowStatus ?? "";
      return as.localeCompare(bs);
    });

    return rows;
  }, [partners, query, statusFilter, sortKey]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tPage("searchPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-gold/40 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
          aria-label={t("filterStatus")}
        >
          <option value="all">{t("filterAll")}</option>
          <option value="no_status">{t("filterNoStatus")}</option>
          {WORKFLOW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tPage(`status.${s}`)}
            </option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
          aria-label={t("sortBy")}
        >
          <option value="name">{t("sortName")}</option>
          <option value="submissions">{t("sortSubmissions")}</option>
          <option value="cupScore">{t("sortCupScore")}</option>
          <option value="status">{t("sortStatus")}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/45">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => {
            const selected = selectedId === p.userId;
            const pending = pendingId === p.userId;
            return (
              <li
                key={p.userId}
                className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  selected
                    ? "border-gold/40 bg-gold/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                >
                  <GrowthAvatar
                    name={p.name}
                    email={p.email}
                    avatarUrl={p.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-white">
                      <span className="truncate">{p.name ?? p.email}</span>
                      {p.consentGiven ? (
                        <CreatorConsentVerifiedBadge
                          label={tConsent("verifiedBadge")}
                          size="sm"
                        />
                      ) : null}
                    </p>
                    <p className="truncate text-[10px] text-white/45">{p.email}</p>
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] leading-relaxed text-white/40">
                      {p.workflowStatus ? (
                        <span>{tPage(`status.${p.workflowStatus}`)}</span>
                      ) : null}
                      <span>{t("metaSubmissions", { n: p.totalSubmissions })}</span>
                      {p.cupScore > 0 ? (
                        <span className="text-gold">{t("metaCup", { score: p.cupScore })}</span>
                      ) : null}
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    title={p.consentGiven ? tConsent("consentedLabel") : tConsent("notConsented")}
                    aria-label={p.consentGiven ? tConsent("consentedLabel") : tConsent("notConsented")}
                  >
                    <IconShield
                      size={16}
                      className={p.consentGiven ? "text-emerald-400" : "text-amber-400"}
                      aria-hidden
                    />
                  </span>
                  {p.hasBadge ? (
                    <BadgeIcon badgeKey="content_creator" earned chip size="xs" name="" />
                  ) : null}
                  {p.inRoom ? (
                    <GoldButton
                      type="button"
                      variant="danger"
                      disabled={pending || p.hasBadge}
                      onClick={() => onRevokeLounge(p.userId)}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      {pending ? "…" : tPage("revokeLounge")}
                    </GoldButton>
                  ) : (
                    <GoldButton
                      type="button"
                      variant="primary"
                      disabled={pending || p.hasLoungeAccess}
                      onClick={() => onGrantLounge(p.userId)}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      {pending
                        ? "…"
                        : p.hasLoungeAccess
                          ? tPage("hasLoungeAccess")
                          : tPage("grantLounge")}
                    </GoldButton>
                  )}
                  <GoldButton
                    type="button"
                    variant="ghost"
                    onClick={() => onSelect(p)}
                    className="!px-3 !py-1.5 text-xs"
                  >
                    {t("viewDetail")}
                  </GoldButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
