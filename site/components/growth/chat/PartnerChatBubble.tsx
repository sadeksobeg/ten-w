"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import type { PartnerChatSummary } from "@/lib/growth/chat-service";
import { GrowthChatThread } from "@/components/growth/chat/GrowthChatThread";

const STORAGE_KEY = "growthChatOpen";

type Props = {
  locale: string;
  viewerUserId: string;
};

export function PartnerChatBubble({ locale, viewerUserId }: Props) {
  const t = useTranslations("Growth.chat.bubble");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<PartnerChatSummary | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isChatPage = pathname === "/growth/chat" || pathname.endsWith("/growth/chat");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const refreshSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/chat/partner-summary");
      if (!res.ok) return;
      const data = (await res.json()) as PartnerChatSummary;
      setSummary(data);
    } catch {
      /* ignore */
    }
  }, []);

  const markRead = useCallback(async () => {
    if (!summary?.openConversationId) return;
    try {
      await fetch(`/api/growth/chat/${summary.openConversationId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setSummary((s) => (s ? { ...s, unreadCount: 0 } : s));
      window.dispatchEvent(new CustomEvent("growth-chat-read"));
    } catch {
      /* ignore */
    }
  }, [summary?.openConversationId]);

  useEffect(() => {
    void refreshSummary();
    const id = window.setInterval(() => void refreshSummary(), 20000);
    return () => window.clearInterval(id);
  }, [refreshSummary]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("openChat") === "1") {
      setOpen(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("growth-open-chat", onOpen);
    return () => window.removeEventListener("growth-open-chat", onOpen);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (open) void markRead();
  }, [open, markRead]);

  useEffect(() => {
    const onRead = () => void refreshSummary();
    window.addEventListener("growth-chat-read", onRead);
    return () => window.removeEventListener("growth-chat-read", onRead);
  }, [refreshSummary]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelector<HTMLElement>(
      'button, [href], textarea, input, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [open]);

  if (isChatPage || !summary) return null;

  const unread = summary.unreadCount;
  const sideClass = locale === "ar" ? "left-4" : "right-4";

  return (
    <div dir={dir} className="growth-chat-bubble-root pointer-events-none fixed inset-0 z-[60]">
      {open ? (
        <button
          type="button"
          className="pointer-events-auto fixed inset-0 bg-black/50 backdrop-blur-[2px]"
          aria-label={t("closeOverlay")}
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("panelTitle")}
          className={`growth-chat-bubble-panel pointer-events-auto fixed bottom-[5.5rem] ${sideClass} flex w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#050816]/98 shadow-[var(--growth-chat-bubble-shadow)] backdrop-blur-xl lg:bottom-6`}
        >
          <header className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">{t("panelTitle")}</p>
              <p className="truncate text-[10px] text-white/45">{t("supportHours")}</p>
            </div>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-[10px] font-semibold text-white/50 hover:bg-white/10"
              onClick={() => {
                try {
                  const on = localStorage.getItem("growthChatChime") === "1";
                  localStorage.setItem("growthChatChime", on ? "0" : "1");
                } catch {
                  /* ignore */
                }
              }}
              aria-label={t("toggleSound")}
              title={t("toggleSound")}
            >
              🔔
            </button>
            <Link
              href="/growth/chat"
              className="rounded-lg border border-gold/30 px-2 py-1 text-[10px] font-semibold text-gold hover:bg-gold/10"
            >
              {t("expand")}
            </Link>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-lg leading-none text-white/60 hover:bg-white/10"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <div className="min-h-0 flex-1" style={{ height: "min(56vh, 480px)" }}>
            <GrowthChatThread
              conversationId={summary.openConversationId}
              viewerUserId={viewerUserId}
              isAdmin={false}
              locale={locale}
              embedded
              partnerHistoryMode
              hideThreadTitle
              className="h-full"
              shareContext={{
                referralCode: summary.referralCode,
                lastDealLabel: summary.lastDealLabel,
              }}
              onPartnerMessage={() => void refreshSummary()}
            />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("open")}
        className={`growth-chat-bubble-fab pointer-events-auto fixed bottom-[5.5rem] ${sideClass} flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-gold/60 to-gold/25 text-2xl shadow-[var(--growth-chat-bubble-shadow)] ring-2 ring-gold/40 transition hover:scale-105 active:scale-95 lg:bottom-6`}
      >
        <span aria-hidden>💬</span>
        {unread > 0 ? (
          <span className="absolute -top-0.5 end-0 flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-[#0a0a0f]">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
}
