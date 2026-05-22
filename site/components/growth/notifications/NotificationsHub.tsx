"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { markAllNotificationsReadAction } from "@/lib/growth/actions";
import {
  IconAlert,
  IconBadge,
  IconDeals,
  IconEarnings,
  IconEvent,
  IconLevel,
  IconNotifications,
  IconXp,
} from "@/components/growth/icons/GrowthIcons";
import { EmptyState } from "@/components/growth/ui/EmptyState";

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  type: string;
};

type Props = {
  initial: NotificationRow[];
  locale: string;
};

function NotificationTypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  switch (type) {
    case "EVENT_INVITE":
    case "EVENT_REMINDER":
    case "EVENT_MILESTONE":
      return <IconEvent size={size} />;
    case "BADGE_EARNED":
      return <IconBadge size={size} />;
    case "LEVEL_UP":
      return <IconLevel size={size} />;
    case "XP_BOOST":
      return <IconXp size={size} />;
    case "PAYOUT_UPDATE":
      return <IconEarnings size={size} />;
    case "DEAL_CLOSED":
      return <IconDeals size={size} />;
    default:
      return <IconAlert size={size} />;
  }
}

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
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = filter === "unread" ? rows.filter((r) => !r.isRead) : rows;
  const unreadCount = rows.filter((r) => !r.isRead).length;

  const grouped = useMemo(() => {
    const map: Record<string, NotificationRow[]> = {
      today: [],
      yesterday: [],
      week: [],
    };
    for (const n of visible) {
      map[dayGroup(n.createdAt)].push(n);
    }
    return map;
  }, [visible]);

  async function markAll() {
    await markAllNotificationsReadAction();
    setRows((prev) => prev.map((r) => ({ ...r, isRead: true })));
  }

  const groupLabels: Record<string, string> = {
    today: t("groupToday"),
    yesterday: t("groupYesterday"),
    week: t("groupWeek"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="inline-flex items-center gap-2 font-[family-name:var(--font-cairo)] text-2xl font-extrabold">
          <IconNotifications size={24} className="text-gold" />
          {t("title")}
        </h1>
        <button
          type="button"
          onClick={() => void markAll()}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/40"
        >
          {t("markAllRead")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
            filter === "all" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[0.04] text-white/50"
          }`}
        >
          {t("filterAll")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-gold/40 ${
            filter === "unread" ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-white/[0.04] text-white/50"
          }`}
        >
          {t("filterUnread")}
          {unreadCount > 0 ? (
            <span className="ms-1 rounded-full bg-gold px-1.5 text-[9px] text-bg">{unreadCount}</span>
          ) : null}
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
                    <Link
                      href={n.link ?? "#"}
                      className={`flex gap-3 rounded-xl border px-4 py-3 transition hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-gold/40 ${
                        n.isRead
                          ? "border-white/10 bg-black/20"
                          : "border-s-[3px] border-s-gold border-white/10 bg-gold/5"
                      }`}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-gold">
                        <NotificationTypeIcon type={n.type} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{n.title}</p>
                        <p className="line-clamp-2 text-xs text-white/50">{n.body}</p>
                      </span>
                      {!n.isRead ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
