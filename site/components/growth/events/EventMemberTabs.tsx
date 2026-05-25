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
    <GlassCard className="overflow-hidden p-0">
      <div className="flex border-b border-white/10">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 px-4 py-3 text-xs font-bold transition ${
              tab === key
                ? "border-b-2 border-gold bg-gold/10 text-gold"
                : "text-white/55 hover:text-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {tab === "chat" ? chat : null}
        {tab === "progress" ? <div className="p-6">{progress}</div> : null}
        {tab === "posts" ? (
          <div className="overflow-x-hidden p-3 sm:p-5">{posts}</div>
        ) : null}
      </div>
    </GlassCard>
  );
}
