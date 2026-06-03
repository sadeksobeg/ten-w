"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  IconChevronRight,
  IconCheck,
  IconClose,
  IconNotifications,
} from "@/components/growth/icons/GrowthIcons";
import { NotificationTypeIcon } from "@/lib/growth/notification-styles";
import type { GrowthNotificationRow } from "@/lib/growth/notification-types";
import { relativeDate } from "@/lib/growth/relative-date";

type ListProps = {
  locale: string;
  items: GrowthNotificationRow[];
  unread: number;
  onSelect: (n: GrowthNotificationRow) => void;
  onMarkAll: () => void;
  onClose: () => void;
  showViewAll?: boolean;
};

export function NotificationListView({
  locale,
  items,
  unread,
  onSelect,
  onMarkAll,
  onClose,
  showViewAll = true,
}: ListProps) {
  const t = useTranslations("Growth.notifications");

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 text-base font-bold text-white">
            <IconNotifications size={18} className="shrink-0 text-gold" />
            {t("title")}
          </span>
          {unread > 0 ? (
            <p className="mt-0.5 text-xs text-gold/90">
              {t("unreadCount", { count: unread })}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {unread > 0 ? (
            <button
              type="button"
              onClick={() => void onMarkAll()}
              className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-[11px] font-bold text-gold transition hover:bg-gold/20 focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              {t("markAllRead")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-gold/30 hover:text-white focus-visible:ring-2 focus-visible:ring-gold/40"
            aria-label={t("close")}
          >
            <IconClose size={18} />
          </button>
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-3">
        {items.length === 0 ? (
          <li className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-gold/10">
              <IconNotifications size={28} className="text-gold/50" />
            </span>
            <p className="text-sm text-white/50">{t("empty")}</p>
          </li>
        ) : (
          items.slice(0, 20).map((n) => (
            <li key={n.id} className="mb-1.5">
              <button
                type="button"
                onClick={() => onSelect(n)}
                className={`flex w-full gap-3 rounded-xl border px-3 py-3.5 text-start transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-gold/40 sm:px-4 ${
                  !n.isRead
                    ? "border-gold/25 bg-gold/[0.06] shadow-[inset_3px_0_0_0_var(--color-gold,#E4B84D)]"
                    : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <NotificationTypeIcon type={n.type} size={18} circleSize={44} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-bold leading-snug text-white">
                      {n.title}
                    </span>
                    {!n.isRead ? (
                      <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
                        {t("unread")}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">
                    {n.body}
                  </span>
                  <span className="mt-1.5 block text-[11px] text-white/35">
                    {relativeDate(n.createdAt, locale)}
                  </span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>

      {showViewAll && items.length > 0 ? (
        <div className="shrink-0 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
          <Link
            href="/growth/notifications"
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-sm font-bold text-gold transition hover:bg-gold/20 focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            {t("viewAll")}
          </Link>
        </div>
      ) : null}
    </>
  );
}

type DetailProps = {
  locale: string;
  notification: GrowthNotificationRow;
  onBack: () => void;
  onOpen: () => void;
};

export function NotificationDetailView({
  locale,
  notification: n,
  onBack,
  onOpen,
}: DetailProps) {
  const t = useTranslations("Growth.notifications");

  return (
    <div className="growth-notif-detail-enter flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-gold/30 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/40"
          aria-label={t("back")}
        >
          <IconChevronRight size={20} className="rotate-180 rtl:rotate-0" />
        </button>
        <span className="text-sm font-semibold text-white/70">{t("back")}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col items-center text-center">
          <NotificationTypeIcon type={n.type} size={28} circleSize={72} />
          {!n.isRead ? (
            <span className="mt-3 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
              {t("unread")}
            </span>
          ) : (
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-white/40">
              <IconCheck size={14} className="text-emerald-400" />
              {t("readLabel")}
            </span>
          )}
        </div>

        <h2 className="mt-5 text-center font-[family-name:var(--font-cairo)] text-xl font-bold leading-snug text-white sm:text-2xl">
          {n.title}
        </h2>
        <p className="mt-2 text-center text-xs text-white/40">
          {relativeDate(n.createdAt, locale)}
        </p>
        <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-white/75">
          {n.body}
        </p>
      </div>

      <div className="shrink-0 flex flex-col gap-2 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {n.link ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-bold text-bg shadow-lg shadow-gold/20 transition hover:bg-gold-bright focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            {t("open")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 w-full items-center justify-center rounded-xl border border-white/12 text-sm font-semibold text-white/70 transition hover:border-gold/30 hover:text-white focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {t("backToList")}
        </button>
      </div>
    </div>
  );
}
