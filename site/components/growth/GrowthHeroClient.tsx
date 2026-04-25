"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  levelName: string;
  earningsCents: number;
  pendingDeals: number;
  progressCurrent: number;
  progressTarget: number;
  weeklyRank: number;
  weeklyClosed: number;
  weeklyFieldSize: number;
};

function formatUsd(cents: number, locale: string): string {
  const nfLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(nfLocale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function GrowthHeroClient({
  levelName,
  earningsCents,
  pendingDeals,
  progressCurrent,
  progressTarget,
  weeklyRank,
  weeklyClosed,
  weeklyFieldSize,
}: Props) {
  const t = useTranslations("Growth.heroClient");
  const locale = useLocale();
  const safeTarget = Math.max(1, progressTarget);
  const pct = Math.min(100, Math.round((progressCurrent / safeTarget) * 100));

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/80 backdrop-blur-md"
        >
          <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_18px_rgba(201,160,97,0.9)]" />
          {t("pillBrand")}
          <span className="text-white/40">•</span>
          <span className="text-white/70">{t("pillSubtitle")}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="mt-5 font-[family-name:var(--font-cairo)] text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          <span className="bg-gradient-to-r from-gold via-gold-bright to-gold bg-clip-text text-transparent">
            {levelName}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base"
        >
          {t("tagline")}
        </motion.p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:col-span-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_24px_70px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_0_32px_-12px_rgba(201,160,97,0.25)]"
        >
          <div className="text-xs text-white/55">{t("totalEarnings")}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {formatUsd(earningsCents, locale)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_0_28px_-14px_rgba(168,85,247,0.2)]"
        >
          <div className="text-xs text-white/55">{t("activeDeals")}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{pendingDeals}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-gold/25"
        >
          <div className="text-xs text-white/55">{t("weeklyRankLabel")}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-gold/90">
            #{weeklyRank}
          </div>
          <div className="mt-1 text-xs text-white/50">
            {t("weeklyRankSub", { closed: weeklyClosed, total: weeklyFieldSize })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-gold/20"
        >
          <div className="text-xs text-white/55">{t("progress")}</div>
          <div className="mt-2 text-sm font-medium text-white/80 tabular-nums">{pct}%</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold/30 via-gold to-gold-bright"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-white/55">
            {t("progressDeals", { current: progressCurrent, target: progressTarget })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
