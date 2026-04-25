"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ChatConversationListItem,
  ChatInboxSegment,
} from "@/lib/growth/chat-service";
import { GrowthChatThread } from "@/components/growth/chat/GrowthChatThread";
import { PartnerContextPanel } from "@/components/growth/chat/PartnerContextPanel";

type Props = {
  locale: string;
  adminUserId: string;
};

type InboxFilter = "all" | "open" | "closing_now" | "new" | ChatInboxSegment;

export function GrowthAdminChatClient({ locale, adminUserId }: Props) {
  const t = useTranslations("Growth.chat.admin");
  const ti = useTranslations("Growth.chat.intelligence");
  const [rows, setRows] = useState<ChatConversationListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [inboxNonce, setInboxNonce] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/growth/chat/conversations");
    if (!res.ok) return;
    const data = (await res.json()) as { items: ChatConversationListItem[] };
    setRows(data.items);
    setSelected((sel) => {
      if (sel && data.items.some((i) => i.id === sel)) return sel;
      return data.items[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(id);
  }, [load, inboxNonce]);

  const bumpInbox = useCallback(() => {
    setInboxNonce((n) => n + 1);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "all") return true;
      if (filter === "open") return r.status === "OPEN";
      if (filter === "closing_now") {
        return (
          r.featuredCloseProbability != null && r.featuredCloseProbability >= 58
        );
      }
      if (filter === "new") return r.isFresh;
      return r.segment === filter;
    });
  }, [rows, filter]);

  const resolve = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/growth/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      bumpInbox();
      if (selected === id) setSelected(null);
    } finally {
      setBusyId(null);
    }
  };

  const segmentDot = (s: ChatInboxSegment) => {
    if (s === "high_value") return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
    if (s === "at_risk") return "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.45)]";
    return "bg-white/25";
  };

  const filterBtn = (key: InboxFilter, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setFilter(key)}
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition hover:scale-105 active:scale-95 ${
        filter === key
          ? "bg-gold/25 text-white shadow-[0_0_16px_rgba(234,179,8,0.2)] ring-1 ring-gold/45"
          : "bg-white/[0.04] text-white/50 hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,320px)]">
      <div className="rounded-2xl border border-white/10 bg-[#050816]/80 p-4 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/45">
          {t("inbox")}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {filterBtn("all", ti("filterAll"))}
          {filterBtn("new", ti("filterNew"))}
          {filterBtn("closing_now", ti("filterClosing"))}
          {filterBtn("open", ti("filterOpen"))}
          {filterBtn("high_value", ti("segmentHigh"))}
          {filterBtn("at_risk", ti("segmentAtRisk"))}
        </div>
        <ul className="mt-3 max-h-[min(70vh,640px)] space-y-2 overflow-y-auto pe-1">
          {filtered.map((r) => {
            const segmentTitle =
              r.segment === "high_value"
                ? ti("segmentHigh")
                : r.segment === "at_risk"
                  ? ti("segmentAtRisk")
                  : ti("segmentStandard");
            const momentumLabel =
              r.momentumKey === "rising"
                ? ti("momentumRising")
                : r.momentumKey === "dropping"
                  ? ti("momentumDropping")
                  : ti("momentumStable");
            const momentumArrow =
              r.momentumKey === "rising" ? "↗" : r.momentumKey === "dropping" ? "↘" : "→";
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-start text-sm transition duration-200 hover:scale-[1.01] hover:border-gold/25 hover:shadow-[0_0_22px_rgba(0,0,0,0.35)] active:scale-[0.99] ${
                    selected === r.id
                      ? "border-gold/45 bg-gold/10 text-white shadow-[0_0_24px_rgba(234,179,8,0.18)]"
                      : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${segmentDot(r.segment)}`}
                      title={segmentTitle}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                        <span className="font-bold text-white">
                          {r.partnerName ?? r.partnerEmail}
                        </span>
                        <span
                          className={`text-[10px] font-bold tabular-nums ${
                            r.momentumKey === "rising"
                              ? "text-emerald-300"
                              : r.momentumKey === "dropping"
                                ? "text-rose-300"
                                : "text-white/45"
                          }`}
                          title={momentumLabel}
                        >
                          {momentumArrow} {momentumLabel}
                        </span>
                        {r.featuredCloseProbability != null ? (
                          <span className="text-[11px] font-bold tabular-nums text-gold/90">
                            {ti("inboxProb", { n: r.featuredCloseProbability })}
                          </span>
                        ) : null}
                        {r.timeToActMinutes != null ? (
                          <span
                            className={`text-[10px] font-black tabular-nums uppercase tracking-wide ${
                              r.timeToActMinutes <= 16
                                ? "text-rose-200"
                                : "text-amber-200/90"
                            }`}
                            title={
                              r.timeToActMinutes <= 20 ? t("windowClosing") : undefined
                            }
                          >
                            {t("timeToAct", { m: r.timeToActMinutes })}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-xs text-white/45">{r.partnerEmail}</div>
                      {r.featuredDealLabel ? (
                        <div className="mt-1 text-[11px] font-medium text-sky-200/85">
                          {r.featuredDealLabel}
                        </div>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-white/40">
                        <span>
                          {(r.earningsCents / 100).toLocaleString(
                            locale === "ar"
                              ? "ar-SA"
                              : locale === "fr"
                                ? "fr-FR"
                                : "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            },
                          )}
                        </span>
                        <span>·</span>
                        <span>{ti("closedLabel", { n: r.closedDeals })}</span>
                        {r.isFresh ? (
                          <span className="rounded bg-violet-500/25 px-1 font-bold uppercase text-violet-200 ring-1 ring-violet-400/30">
                            {ti("filterNew")}
                          </span>
                        ) : null}
                        {r.priority === "HIGH" ? (
                          <span className="rounded bg-rose-500/20 px-1 font-bold uppercase text-rose-200 ring-1 ring-rose-400/30">
                            {ti("priorityHigh")}
                          </span>
                        ) : null}
                        {r.linkedDealId ? (
                          <span className="rounded bg-sky-500/15 px-1 font-bold uppercase text-sky-200/90 ring-1 ring-sky-400/25">
                            {ti("linkedPill")}
                          </span>
                        ) : null}
                      </div>
                      {r.preview ? (
                        <div className="mt-1 line-clamp-2 text-xs text-white/55">
                          {r.preview}
                        </div>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            r.status === "OPEN" ? "text-emerald-200" : "text-white/40"
                          }`}
                        >
                          {r.status === "OPEN" ? t("open") : t("resolved")}
                        </span>
                        {r.status === "OPEN" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void resolve(r.id);
                            }}
                            className={`text-[10px] font-semibold text-rose-200/90 transition hover:scale-105 hover:underline active:scale-95 ${
                              busyId === r.id ? "pointer-events-none opacity-50" : ""
                            }`}
                          >
                            {t("resolve")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#050816]/60 p-4 backdrop-blur-xl">
        {selected ? (
          <GrowthChatThread
            conversationId={selected}
            viewerUserId={adminUserId}
            isAdmin
            locale={locale}
            hideThreadTitle
            scrollMaxClassName="max-h-[min(58vh,520px)]"
          />
        ) : (
          <div className="text-sm text-white/50">{t("pick")}</div>
        )}
      </div>

      <PartnerContextPanel
        conversationId={selected}
        locale={locale}
        onConversationMetaChange={bumpInbox}
      />
    </div>
  );
}
