"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IconNotifications } from "@/components/growth/icons/GrowthIcons";
import {
  NotificationDetailView,
  NotificationListView,
} from "@/components/growth/notifications/NotificationPanelViews";
import { useNotificationRead } from "@/components/growth/notifications/use-notification-read";
import type { GrowthNotificationRow } from "@/lib/growth/notification-types";
import { playNotificationSound } from "@/lib/growth/notification-sound";

type Props = { locale: string };

export function NotificationBell({ locale }: Props) {
  const t = useTranslations("Growth.notifications");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<GrowthNotificationRow | null>(null);
  const [items, setItems] = useState<GrowthNotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef<HTMLButtonElement>(null);
  const prevUnreadRef = useRef<number | null>(null);

  const { markRead, markAll } = useNotificationRead(items, setItems, setUnread);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: GrowthNotificationRow[];
        unreadCount: number;
      };
      if (prevUnreadRef.current !== null && data.unreadCount > prevUnreadRef.current) {
        playNotificationSound();
      }
      prevUnreadRef.current = data.unreadCount;
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  const closePanel = useCallback(() => {
    setOpen(false);
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        else closePanel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, selected, closePanel]);

  function onSelect(n: GrowthNotificationRow) {
    if (!n.isRead) void markRead(n.id);
    setSelected(n);
  }

  function onOpenDetail() {
    if (!selected?.link) return;
    closePanel();
    router.push(selected.link);
  }

  const panelContent = selected ? (
    <NotificationDetailView
      locale={locale}
      notification={selected}
      onBack={() => setSelected(null)}
      onOpen={onOpenDetail}
    />
  ) : (
    <NotificationListView
      locale={locale}
      items={items}
      unread={unread}
      onSelect={onSelect}
      onMarkAll={() => void markAll()}
      onClose={closePanel}
    />
  );

  return (
    <>
      <button
        ref={bellRef}
        type="button"
        onClick={() => {
          setOpen((v) => {
            if (v) {
              setSelected(null);
              return false;
            }
            return true;
          });
        }}
        className="relative rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-gold transition hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
        aria-label={t("title")}
        aria-expanded={open}
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

      {open && mounted
        ? createPortal(
            <>
              <button
                type="button"
                className="growth-notif-backdrop-enter fixed inset-0 z-[200] bg-black/65 backdrop-blur-[2px]"
                aria-label={t("close")}
                onClick={closePanel}
              />

              {/* Mobile: bottom sheet */}
              <div
                className="growth-notif-sheet-enter fixed inset-x-0 bottom-0 z-[201] flex max-h-[min(92dvh,720px)] flex-col overflow-hidden rounded-t-[1.75rem] border border-white/12 border-b-0 bg-[#080d18] shadow-[0_-24px_80px_rgba(0,0,0,0.55)] md:hidden"
                dir={locale === "ar" ? "rtl" : "ltr"}
                role="dialog"
                aria-modal="true"
                aria-label={t("title")}
              >
                <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20" aria-hidden />
                {panelContent}
              </div>

              {/* Desktop: centered panel */}
              <div
                className="growth-notif-sheet-enter fixed end-4 top-[4.5rem] z-[201] hidden w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#080d18] shadow-2xl md:flex md:max-h-[min(80vh,640px)]"
                dir={locale === "ar" ? "rtl" : "ltr"}
                role="dialog"
                aria-modal="true"
                aria-label={t("title")}
              >
                {panelContent}
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
