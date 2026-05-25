"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Tab = "chat" | "progress" | "posts";

type Props = {
  chat: ReactNode;
  progress: ReactNode;
  posts: ReactNode;
};

export function EventMemberTabs({ chat, progress, posts }: Props) {
  const t = useTranslations("Growth.events");
  const [tab, setTab] = useState<Tab>("chat");

  const tabs: { key: Tab; label: string }[] = [
    { key: "chat", label: t("tabChat") },
    { key: "progress", label: t("tabProgress") },
    { key: "posts", label: t("tabPosts") },
  ];

  return (
    <GlassCard className="max-w-full overflow-hidden p-0">
      <div className="flex border-b border-white/10">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`min-w-0 flex-1 px-2 py-2.5 text-[10px] font-bold transition sm:px-4 sm:py-3 sm:text-xs ${
              tab === key
                ? "border-b-2 border-gold bg-gold/10 text-gold"
                : "text-white/55 hover:text-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="max-w-full overflow-hidden">
        {tab === "chat" ? <div className="event-member-chat-shell">{chat}</div> : null}
        {tab === "progress" ? <div className="p-6">{progress}</div> : null}
        {tab === "posts" ? (
          <div className="overflow-x-hidden p-3 sm:p-5">{posts}</div>
        ) : null}
      </div>
    </GlassCard>
  );
}
