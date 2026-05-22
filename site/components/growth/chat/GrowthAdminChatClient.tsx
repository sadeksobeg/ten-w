"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ChatConversationListItem } from "@/lib/growth/chat-service";
import { GrowthChatThread } from "@/components/growth/chat/GrowthChatThread";
import {
  GrowthChatInbox,
  type InboxFilter,
} from "@/components/growth/chat/GrowthChatInbox";
import { PartnerContextPanel } from "@/components/growth/chat/PartnerContextPanel";

type Props = {
  locale: string;
  adminUserId: string;
  initialConversationId?: string | null;
  initialPartnerUserId?: string | null;
};

export function GrowthAdminChatClient({
  locale,
  adminUserId,
  initialConversationId = null,
  initialPartnerUserId = null,
}: Props) {
  const t = useTranslations("Growth.chat.admin");
  const ti = useTranslations("Growth.chat.intelligence");
  const [rows, setRows] = useState<ChatConversationListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(initialConversationId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [inboxNonce, setInboxNonce] = useState(0);
  const [contextOpen, setContextOpen] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openingPartner, setOpeningPartner] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/chat/conversations");
      if (!res.ok) {
        setLoadError(t("loadError"));
        return;
      }
      setLoadError(null);
      const data = (await res.json()) as { items: ChatConversationListItem[] };
      setRows(data.items);
      setSelected((sel) => {
        if (sel && data.items.some((i) => i.id === sel)) return sel;
        if (initialConversationId && data.items.some((i) => i.id === initialConversationId)) {
          return initialConversationId;
        }
        return data.items[0]?.id ?? null;
      });
    } catch {
      setLoadError(t("loadError"));
    }
  }, [initialConversationId, t]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(id);
  }, [load, inboxNonce]);

  useEffect(() => {
    if (!initialPartnerUserId) return;
    let cancelled = false;
    setOpeningPartner(true);
    void (async () => {
      try {
        const res = await fetch("/api/growth/chat/conversations/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerUserId: initialPartnerUserId }),
        });
        if (!res.ok) {
          if (!cancelled) setLoadError(t("openPartnerError"));
          return;
        }
        const data = (await res.json()) as { conversationId: string };
        if (!cancelled) {
          setSelected(data.conversationId);
          setInboxNonce((n) => n + 1);
        }
      } catch {
        if (!cancelled) setLoadError(t("openPartnerError"));
      } finally {
        if (!cancelled) setOpeningPartner(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPartnerUserId, t]);

  const bumpInbox = useCallback(() => {
    setInboxNonce((n) => n + 1);
  }, []);

  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selected) ?? null,
    [rows, selected],
  );

  const resolve = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`/api/growth/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      bumpInbox();
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)),
      );
    } finally {
      setBusyId(null);
    }
  };

  const segmentTitle = (r: ChatConversationListItem) => {
    if (r.segment === "high_value") return ti("segmentHigh");
    if (r.segment === "at_risk") return ti("segmentAtRisk");
    return ti("segmentStandard");
  };

  return (
    <div className="flex h-[min(78vh,760px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#030712]/90 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex-row">
      {loadError ? (
        <div
          className="shrink-0 border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-center text-xs font-semibold text-rose-200 lg:absolute lg:inset-x-0 lg:top-0 lg:z-10"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}
      {openingPartner ? (
        <div className="shrink-0 border-b border-gold/20 bg-gold/5 px-4 py-2 text-center text-xs text-gold lg:absolute lg:inset-x-0 lg:top-8 lg:z-10">
          {t("openingPartner")}
        </div>
      ) : null}

      <GrowthChatInbox
        locale={locale}
        rows={rows}
        selectedId={selected}
        filter={filter}
        onFilterChange={setFilter}
        onSelect={setSelected}
        onResolve={(id) => void resolve(id)}
        busyId={busyId}
        className="w-full shrink-0 lg:w-[min(100%,320px)]"
      />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col border-white/10 lg:border-s-0">
        {selected && selectedRow ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#050816]/95 px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-[family-name:var(--font-cairo)] text-lg font-black text-white">
                  {selectedRow.partnerName ?? selectedRow.partnerEmail}
                </h2>
                <p className="truncate text-xs text-white/45">{selectedRow.partnerEmail}</p>
              </div>
              <div className="hidden flex-wrap items-center justify-end gap-1.5 sm:flex">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase text-white/55">
                  {segmentTitle(selectedRow)}
                </span>
                {selectedRow.featuredCloseProbability != null ? (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-gold">
                    {ti("inboxProb", { n: selectedRow.featuredCloseProbability })}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    selectedRow.status === "OPEN"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-white/10 text-white/45"
                  }`}
                >
                  {selectedRow.status === "OPEN" ? t("open") : t("resolved")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setContextOpen((o) => !o)}
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60 transition hover:border-gold/30 hover:text-white xl:hidden"
              >
                {contextOpen ? t("hideContext") : t("showContext")}
              </button>
            </header>
            <div className="min-h-0 flex-1">
              <GrowthChatThread
                conversationId={selected}
                viewerUserId={adminUserId}
                isAdmin
                locale={locale}
                hideThreadTitle
                embedded
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm text-white/50">{t("pick")}</p>
            <p className="max-w-xs text-xs text-white/35">{t("pickHint")}</p>
          </div>
        )}
      </section>

      <div
        className={`min-h-0 shrink-0 overflow-y-auto border-white/10 bg-[#050816]/80 lg:w-[min(100%,300px)] lg:border-s ${
          contextOpen ? "max-h-[40vh] border-t lg:max-h-none" : "hidden lg:block"
        }`}
      >
        <PartnerContextPanel
          conversationId={selected}
          locale={locale}
          onConversationMetaChange={bumpInbox}
        />
      </div>
    </div>
  );
}
