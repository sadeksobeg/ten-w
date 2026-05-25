"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type Tab = "chat" | "progress" | "posts";

type Props = {
  chat: ReactNode;
  progress: ReactNode;
  posts: ReactNode;
};

export function EventMemberTabs({ chat, progress, posts }: Props) {
  const t = useTranslations("Growth.events");
  const [tab, setTab] = useState<Tab>("posts");

  const tabs: { key: Tab; label: string }[] = [
    { key: "chat", label: t("tabChat") },
    { key: "progress", label: t("tabProgress") },
    { key: "posts", label: t("tabPosts") },
  ];

  return (
    <section className="event-member-hub" aria-label={t("memberHub")}>
      <div className="event-member-hub__tabs" role="tablist">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`event-member-hub__tab ${active ? "event-member-hub__tab--active" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="event-member-hub__panel">
        {tab === "chat" ? <div className="event-member-chat-shell">{chat}</div> : null}
        {tab === "progress" ? <div className="event-member-hub__progress">{progress}</div> : null}
        {tab === "posts" ? <div className="event-posts-tab">{posts}</div> : null}
      </div>
    </section>
  );
}
