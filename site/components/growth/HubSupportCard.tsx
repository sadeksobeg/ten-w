"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { PartnerChatSummary } from "@/lib/growth/chat-service";

export function HubSupportCard() {
  const t = useTranslations("Growth.hub.support");
  const [summary, setSummary] = useState<PartnerChatSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/chat/partner-summary");
      if (!res.ok) return;
      setSummary((await res.json()) as PartnerChatSummary);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onRead = () => void refresh();
    window.addEventListener("growth-chat-read", onRead);
    return () => window.removeEventListener("growth-chat-read", onRead);
  }, [refresh]);

  const openChat = () => {
    try {
      sessionStorage.setItem("growthChatOpen", "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("growth-open-chat"));
  };

  const preview = summary?.lastPreview;
  const fromAdmin = summary?.lastFromAdmin;

  return (
    <div className="growth-card-hover rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-gold">{t("title")}</p>
          {preview ? (
            <p className="mt-2 line-clamp-2 text-sm text-white/80">
              {fromAdmin ? t("lastFromAdmin") : t("lastFromYou")}: {preview}
            </p>
          ) : (
            <p className="mt-2 text-sm text-white/50">{t("empty")}</p>
          )}
          {summary && summary.unreadCount > 0 ? (
            <p className="mt-2 text-xs font-semibold text-rose-300">
              {t("unread", { n: summary.unreadCount })}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openChat}
          className="shrink-0 rounded-full bg-gradient-to-br from-gold/50 to-gold/20 px-4 py-2 text-xs font-bold text-white shadow-[0_0_16px_rgba(234,179,8,0.2)] hover:scale-[1.02]"
        >
          {t("openChat")}
        </button>
      </div>
    </div>
  );
}
