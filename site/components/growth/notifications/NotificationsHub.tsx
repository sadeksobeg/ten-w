"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { markAllNotificationsReadAction } from "@/lib/growth/actions";

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

export function NotificationsHub({ initial, locale }: Props) {
  const t = useTranslations("Growth.notifications");
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = filter === "unread" ? rows.filter((r) => !r.isRead) : rows;

  async function markAll() {
    await markAllNotificationsReadAction();
    setRows((prev) => prev.map((r) => ({ ...r, isRead: true })));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{t("title")}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === "all" ? "bg-gold/20 text-gold" : "text-white/50"}`}
          >
            {t("filterAll")}
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === "unread" ? "bg-gold/20 text-gold" : "text-white/50"}`}
          >
            {t("filterUnread")}
          </button>
          <form action={markAllNotificationsReadAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                void markAll();
              }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-gold/30"
            >
              {t("markAllRead")}
            </button>
          </form>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-white/60">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border px-4 py-3 ${n.isRead ? "border-white/10 bg-black/20" : "border-gold/25 bg-gold/5"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  <p className="mt-1 text-xs text-white/65">{n.body}</p>
                  <p className="mt-2 text-[10px] text-white/40">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead ? (
                  <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-bg">
                    {t("unread")}
                  </span>
                ) : null}
              </div>
              {n.link ? (
                <Link href={n.link} className="mt-2 inline-block text-xs text-gold hover:underline">
                  {t("open")}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
