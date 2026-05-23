"use client";

import { useLocale } from "next-intl";
import { relativeDate } from "@/lib/growth/relative-date";

export function useRelativeDate(date: Date | string): string {
  const locale = useLocale();
  return relativeDate(date, locale);
}
