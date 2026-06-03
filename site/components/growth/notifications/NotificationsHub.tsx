"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IconNotifications } from "@/components/growth/icons/GrowthIcons";
import { NotificationTypeIcon } from "@/lib/growth/notification-styles";
import type { GrowthNotificationRow } from "@/lib/growth/notification-types";
import { relativeDate } from "@/lib/growth/relative-date";
import { EmptyState } from "@/components/growth/ui/EmptyState";
import {
  NotificationDetailView,
} from "@/components/growth/notifications/NotificationPanelViews";
import { useNotificationRead } from "@/components/growth/notifications/use-notification-read";

export type NotificationRow = GrowthNotificationRow;

type Props = {
  initial: GrowthNotificationRow[];
  locale: string;
};

function dayGroup(iso: string): "today" | "yesterday" | "week" {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  if (d >= startToday) return "today";
  if (d >= startYesterday) return "yesterday";
  return "week";
}

export function NotificationsHub({ initial, locale }: Props) {
  const t = useTranslations("Growth.notifications");
  const tEmpty = useTranslations("Growth.empty.notifications");
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selected, setSelected] = useState<GrowthNotificationRow | null>(null);
  const [unreadCount, setUnreadCount] = useState(
    initial.filter((r) => !r.isRead).length,
  );

  const { markRead, markAll } = useNotificationRead(rows, setRows, setUnreadCount);

  const visible = filter === "unread" ? rows.filter((r) => !r.isRead) : rows;

  const grouped = useMemo(() => {
    const map: Record<string, GrowthNotificationRow[]> = {
      today: [],
      yesterday: [],
      week: [],
    };
    for (const n of visible) {
      map[dayGroup(n.createdAt)].push(n);
    }
    return map;
  }, [visible]);

  const groupLabels: Record<string, string> = {
    today: t("groupToday"),
    yesterday: t("groupYesterday"),
    week: t("groupWeek"),
  };

  function onSelect(n: GrowthNotificationRow) {
    if (!n.isRead) void markRead(n.id);
    setSelected(n);
  }

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="inline-flex items-center gap-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          <IconNotifications size={24} className="text-gold" />
          {t("title")}
          {unreadCount > 0 ? (
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-gold">
              {unreadCount}
            </span>
          ) : null}
        </h1>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAll()}
            className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs font-bold text-gold transition hover:bg-gold/20 focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            {t("markAllRead")}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
            filter === "all" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[0.04] text-white/50"
          }`}
        >
          {t("filterAll")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`rounded-full px-4 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
            filter === "unread" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[0.04] text-white/50"
          }`}
        >
          {t("filterUnread")}
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconNotifications size={40} />}
          title={tEmpty("title")}
          subtitle={tEmpty("subtitle")}
        />
      ) : (
        (["today", "yesterday", "week"] as const).map((key) => {
          const items = grouped[key];
          if (items.length === 0) return null;
          return (
            <section key={key}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--growth-text-sub)]">
                {groupLabels[key]}
              </h2>
              <ul className="space-y-2">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(n)}
                      className={`flex w-full gap-3 rounded-xl border px-4 py-4 text-start transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-gold/40 ${
                        n.isRead
                          ? "border-white/10 bg-black/20 hover:bg-white/[0.03]"
                          : "border-gold/25 bg-gold/5 shadow-[inset_3px_0_0_0_var(--color-gold,#E4B84D)]"
                      }`}
                    >
                      <NotificationTypeIcon type={n.type} size={18} circleSize={44} />
                      <span className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug text-white">{n.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">
                          {n.body}
                        </p>
                        <p className="mt-2 text-[11px] text-white/35">
                          {relativeDate(n.createdAt, locale)}
                        </p>
                      </span>
                      {!n.isRead ? (
                        <span className="mt-1 size-2.5 shrink-0 rounded-full bg-gold" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {selected && (
        <div className="fixed inset-0 z-[200] flex flex-col md:items-center md:justify-center md:p-6">
          <button
            type="button"
            className="growth-notif-backdrop-enter absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            aria-label={t("close")}
            onClick={() => setSelected(null)}
          />
          <div
            className="growth-notif-sheet-enter relative z-[201] flex max-h-[min(92dvh,720px)] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-white/12 bg-[#080d18] md:max-h-[min(85vh,640px)] md:max-w-lg md:rounded-2xl"
            dir={locale === "ar" ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20 md:hidden" aria-hidden />
            <NotificationDetailView
              locale={locale}
              notification={selected}
              onBack={() => setSelected(null)}
              onOpen={() => {
                if (selected.link) {
                  setSelected(null);
                  router.push(selected.link);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
