"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EventCard, type EventCardData } from "@/components/growth/events/EventCard";
import { EmptyState } from "@/components/growth/ui/EmptyState";

type Tab = "ALL" | "INVITED" | "JOINED" | "COMPLETED";

type Props = {
  all: EventCardData[];
  invitedSlugs: string[];
  joinedSlugs: string[];
  completedSlugs: string[];
  labels: {
    join: string;
    progress: string;
    view: string;
  };
};

export function EventsHubTabs({
  all,
  invitedSlugs,
  joinedSlugs,
  completedSlugs,
  labels,
}: Props) {
  const t = useTranslations("Growth.events");
  const [tab, setTab] = useState<Tab>("ALL");

  const invitedSet = useMemo(() => new Set(invitedSlugs), [invitedSlugs]);
  const joinedSet = useMemo(() => new Set(joinedSlugs), [joinedSlugs]);
  const completedSet = useMemo(() => new Set(completedSlugs), [completedSlugs]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "INVITED":
        return all.filter((e) => invitedSet.has(e.slug));
      case "JOINED":
        return all.filter((e) => joinedSet.has(e.slug));
      case "COMPLETED":
        return all.filter((e) => completedSet.has(e.slug));
      default:
        return all;
    }
  }, [all, tab, invitedSet, joinedSet, completedSet]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "ALL", label: t("tabAll") },
    { key: "INVITED", label: t("invited") },
    { key: "JOINED", label: t("tabJoined") },
    { key: "COMPLETED", label: t("completed") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 border-b-2 px-3 py-2 text-xs font-bold transition ${
              tab === key
                ? "border-gold text-gold"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState illustration="calendar" message={t("empty")} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((ev) => (
            <EventCard
              key={ev.slug}
              event={ev}
              joinLabel={labels.join}
              progressLabel={labels.progress}
              viewLabel={labels.view}
            />
          ))}
        </div>
      )}
    </div>
  );
}
