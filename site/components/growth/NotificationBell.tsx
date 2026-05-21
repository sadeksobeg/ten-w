"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

function iconForType(type: string): string {
  switch (type) {
    case "EVENT_INVITE":
    case "EVENT_REMINDER":
    case "EVENT_MILESTONE":
      return "🎯";
    case "BADGE_EARNED":
      return "🏆";
    case "LEVEL_UP":
      return "⬆";
    case "XP_BOOST":
      return "⚡";
    case "PAYOUT_UPDATE":
      return "💰";
    case "DEAL_CLOSED":
      return "✓";
    default:
      return "🔔";
  }
}

function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return locale === "ar" ? "الآن" : "now";
  if (min < 60) return locale === "ar" ? `منذ ${min} د` : `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return locale === "ar" ? `منذ ${h} س` : `${h}h`;
  return locale === "ar" ? `منذ ${Math.floor(h / 24)} ي` : `${Math.floor(h / 24)}d`;
}

type Props = { locale: string };

export function NotificationBell({ locale }: Props) {
  const t = useTranslations("Growth.notifications");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationRow[];
        unreadCount: number;
      };
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function markRead(id: string) {
    await fetch(`/api/growth/notifications/${id}/read`, { method: "POST" });
    void load();
  }

  async function markAll() {
    await fetch("/api/growth/notifications/read-all", { method: "POST" });
    void load();
  }

  async function onClickItem(n: NotificationRow) {
    if (!n.isRead) await markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm hover:border-gold/30"
        aria-label={t("title")}
      >
        <span aria-hidden>🔔</span>
        {unread > 0 ? (
          <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute end-0 top-full z-[80] mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1020] shadow-2xl"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-bold">{t("title")}</span>
            <button
              type="button"
              onClick={() => void markAll()}
              className="text-[11px] font-semibold text-gold hover:text-gold-bright"
            >
              {t("markAllRead")}
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-white/50">{t("empty")}</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void onClickItem(n)}
                  className={
                    n.isRead
                      ? "flex w-full gap-3 border-b border-white/5 px-4 py-3 text-start hover:bg-white/[0.03]"
                      : "flex w-full gap-3 border-b border-white/5 bg-gold/5 px-4 py-3 text-start hover:bg-gold/10"
                  }
                >
                  <span className="text-lg" aria-hidden>
                    {iconForType(n.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-white">{n.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/55">{n.body}</span>
                    <span className="mt-1 block text-[10px] text-white/40">
                      {timeAgo(n.createdAt, locale)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
