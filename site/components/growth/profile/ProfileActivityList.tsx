"use client";

import { useLocale } from "next-intl";
import { relativeDate } from "@/lib/growth/relative-date";

type Item = { headline: string; createdAt: string };

type Props = {
  items: Item[];
};

export function ProfileActivityList({ items }: Props) {
  const locale = useLocale();
  return (
    <div className="divide-y divide-white/10">
      {items.map((a, i) => (
        <div key={i} className="flex flex-col gap-0.5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-white/75">{a.headline}</span>
          <span className="text-[10px] text-white/40">{relativeDate(a.createdAt, locale)}</span>
        </div>
      ))}
    </div>
  );
}
