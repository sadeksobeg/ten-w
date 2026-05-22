"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IconCheck, IconNotifications } from "@/components/growth/icons/GrowthIcons";
import { NotificationTypeIcon } from "@/lib/growth/notification-styles";
import { relativeDate } from "@/lib/growth/relative-date";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

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
    const item = items.find((x) => x.id === id);
    if (!item || item.isRead) return;

    const prevItems = items;
    const prevUnread = unread;
    setItems((list) =>
      list.map((x) => (x.id === id ? { ...x, isRead: true } : x)),
    );
    setUnread((c) => Math.max(0, c - 1));

    try {
      const res = await fetch(`/api/growth/notifications/${id}/read`, { method: "POST" });
      if (!res.ok) throw new Error("read failed");
    } catch {
      setItems(prevItems);
      setUnread(prevUnread);
    }
  }

  async function markAll() {
    const prevItems = items;
    const prevUnread = unread;
    setItems((list) => list.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    try {
      const res = await fetch("/api/growth/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error("read-all failed");
    } catch {
      setItems(prevItems);
      setUnread(prevUnread);
    }
  }

  async function onClickItem(n: NotificationRow) {
    if (!n.isRead) void markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-gold hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
        aria-label={t("title")}
      >
        <span className={unread > 0 ? "growth-bell-ring inline-flex" : "inline-flex"} aria-hidden>
          <IconNotifications size={18} />
        </span>
        {unread > 0 ? (
          <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute end-0 top-full z-[80] mt-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1020] shadow-2xl"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <IconNotifications size={16} className="text-gold" />
              {t("title")}
            </span>
            <button
              type="button"
              onClick={() => void markAll()}
              className="text-[11px] font-semibold text-gold hover:text-gold-bright focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              {t("markAllRead")}
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-white/50">
                <IconNotifications size={32} className="text-gold/40" />
                {t("empty")}
              </li>
            ) : (
              items.slice(0, 12).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => void onClickItem(n)}
                    className={`flex w-full gap-3 border-b border-white/5 px-3 py-2.5 text-start transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-gold/40 ${!n.isRead ? "border-s-[3px] border-s-gold bg-gold/[0.04]" : ""}`}
                  >
                    <NotificationTypeIcon type={n.type} size={16} circleSize={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">{n.title}</span>
                      <span className="line-clamp-1 text-[10px] text-white/50">{n.body}</span>
                      <span className="text-[9px] text-white/35">
                        {relativeDate(n.createdAt, locale)}
                      </span>
                    </span>
                    {!n.isRead ? (
                      <IconCheck size={12} className="mt-1 shrink-0 text-gold" aria-hidden />
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
