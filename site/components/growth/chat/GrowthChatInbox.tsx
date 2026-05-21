"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ChatConversationListItem,
  ChatInboxSegment,
} from "@/lib/growth/chat-service";

export type InboxFilter = "all" | "open" | "closing_now" | "new" | "unread" | ChatInboxSegment;

type Props = {
  locale: string;
  rows: ChatConversationListItem[];
  selectedId: string | null;
  filter: InboxFilter;
  onFilterChange: (f: InboxFilter) => void;
  onSelect: (id: string) => void;
  onResolve: (id: string) => void;
  busyId: string | null;
  className?: string;
};

function initials(name: string | null, email: string): string {
  const base = (name?.trim() || email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

function relativeTime(
  iso: string | null,
  locale: string,
  t: (key: string, values?: Record<string, string | number>) => string,
): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return t("justNow");
  if (min < 60) return t("minutesAgo", { m: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t("hoursAgo", { h });
  const d = Math.floor(h / 24);
  return t("daysAgo", { d });
}

function segmentDot(s: ChatInboxSegment) {
  if (s === "high_value") return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
  if (s === "at_risk") return "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.45)]";
  return "bg-white/30";
}

export function GrowthChatInbox({
  locale,
  rows,
  selectedId,
  filter,
  onFilterChange,
  onSelect,
  onResolve,
  busyId,
  className = "",
}: Props) {
  const t = useTranslations("Growth.chat.admin");
  const ti = useTranslations("Growth.chat.intelligence");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "all") {
        /* pass */
      } else if (filter === "open") {
        if (r.status !== "OPEN") return false;
      } else if (filter === "closing_now") {
        if (r.featuredCloseProbability == null || r.featuredCloseProbability < 58) {
          return false;
        }
      } else if (filter === "new") {
        if (!r.isFresh) return false;
      } else if (filter === "unread") {
        if (!r.needsAdminReply) return false;
      } else if (r.segment !== filter) {
        return false;
      }
      if (!q) return true;
      const hay = `${r.partnerName ?? ""} ${r.partnerEmail} ${r.preview ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, filter, query]);

  const unreadCount = useMemo(
    () => rows.filter((r) => r.needsAdminReply).length,
    [rows],
  );

  const money = (cents: number) =>
    (cents / 100).toLocaleString(
      locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
      { style: "currency", currency: "USD", maximumFractionDigits: 0 },
    );

  const filters: { key: InboxFilter; label: string; badge?: number }[] = [
    { key: "all", label: ti("filterAll") },
    { key: "unread", label: t("filterUnread"), badge: unreadCount },
    { key: "new", label: ti("filterNew") },
    { key: "closing_now", label: ti("filterClosing") },
    { key: "open", label: ti("filterOpen") },
    { key: "high_value", label: ti("segmentHigh") },
    { key: "at_risk", label: ti("segmentAtRisk") },
  ];

  return (
    <aside
      className={`flex h-full min-h-0 flex-col border-white/10 bg-[#050816]/90 lg:border-e ${className}`}
    >
      <div className="shrink-0 border-b border-white/10 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
            {t("inbox")}
          </h2>
          {unreadCount > 0 ? (
            <span className="rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-black tabular-nums text-white shadow-[0_0_12px_rgba(244,63,94,0.45)]">
              {unreadCount}
            </span>
          ) : null}
        </div>
        <label className="mt-2 block">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold/35"
          />
        </label>
        <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={`relative shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                filter === f.key
                  ? "bg-gold/25 text-white ring-1 ring-gold/45"
                  : "bg-white/[0.04] text-white/50 hover:text-white/80"
              }`}
            >
              {f.label}
              {f.badge != null && f.badge > 0 ? (
                <span className="ms-1 inline-flex min-w-[1rem] justify-center rounded-full bg-rose-500/80 px-1 text-[9px] font-black text-white">
                  {f.badge > 9 ? "9+" : f.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <li className="px-2 py-8 text-center text-sm text-white/45">{t("noThreads")}</li>
        ) : (
          filtered.map((r) => {
            const active = selectedId === r.id;
            const name = r.partnerName ?? r.partnerEmail;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  className={`group relative w-full rounded-xl px-2.5 py-2.5 text-start transition ${
                    active
                      ? "bg-gold/12 ring-1 ring-gold/40"
                      : "hover:bg-white/[0.05]"
                  }`}
                >
                  {r.needsAdminReply ? (
                    <span
                      className="absolute end-2 top-2 size-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]"
                      title={t("unreadHint")}
                    />
                  ) : null}
                  <div className="flex gap-2.5">
                    <div
                      className={`relative flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        active
                          ? "bg-gold/30 text-white ring-2 ring-gold/50"
                          : "bg-white/10 text-white/80 ring-1 ring-white/15"
                      }`}
                    >
                      {initials(r.partnerName, r.partnerEmail)}
                      <span
                        className={`absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full ring-2 ring-[#050816] ${segmentDot(r.segment)}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 pe-3">
                      <div className="flex items-baseline justify-between gap-1">
                        <span
                          className={`truncate font-bold ${active ? "text-white" : "text-white/90"}`}
                        >
                          {name}
                        </span>
                        <span className="shrink-0 text-[10px] tabular-nums text-white/40">
                          {relativeTime(r.lastMessageAt, locale, t)}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-white/45">{r.partnerEmail}</p>
                      {r.preview ? (
                        <p
                          className={`mt-0.5 line-clamp-2 text-xs ${
                            r.needsAdminReply ? "font-semibold text-white/75" : "text-white/50"
                          }`}
                        >
                          {r.preview}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs italic text-white/30">{t("noPreview")}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                        {r.featuredCloseProbability != null ? (
                          <span className="rounded-md bg-gold/15 px-1.5 py-0.5 font-bold tabular-nums text-gold">
                            {ti("inboxProb", { n: r.featuredCloseProbability })}
                          </span>
                        ) : null}
                        {r.timeToActMinutes != null ? (
                          <span
                            className={`font-bold tabular-nums ${
                              r.timeToActMinutes <= 16 ? "text-rose-300" : "text-amber-200/90"
                            }`}
                          >
                            {t("timeToAct", { m: r.timeToActMinutes })}
                          </span>
                        ) : null}
                        <span className="text-white/35">{money(r.earningsCents)}</span>
                        {r.status === "OPEN" ? (
                          <span className="text-emerald-300/90">{t("open")}</span>
                        ) : (
                          <span className="text-white/35">{t("resolved")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {r.status === "OPEN" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(r.id);
                      }}
                      disabled={busyId === r.id}
                      className="mt-2 w-full rounded-lg border border-white/10 py-1 text-[10px] font-semibold text-white/50 opacity-0 transition group-hover:opacity-100 hover:border-rose-400/30 hover:text-rose-200 disabled:opacity-30"
                    >
                      {t("resolve")}
                    </button>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
