"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createTimeCapsuleFormAction } from "@/lib/growth/engagement-actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { TimeCapsuleVisual } from "@/components/growth/capsule/TimeCapsuleVisual";
import { IconCalendar, IconCapsule, IconClose } from "@/components/growth/icons/GrowthIcons";

type Props = {
  open: boolean;
  onClose: () => void;
  openDateLabel: string;
};

export function TimeCapsuleModal({ open, onClose, openDateLabel }: Props) {
  const t = useTranslations("Growth.capsule");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const charPct = Math.min(100, Math.round((message.length / 500) * 100));

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="growth-capsule-modal w-full max-w-2xl overflow-hidden rounded-t-3xl border border-gold/25 bg-[#070912] shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-labelledby="capsule-title"
      >
        <div className="relative border-b border-gold/15 bg-gradient-to-br from-[#12182a] via-[#0a0c14] to-[#050810] px-6 py-8 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 rounded-full border border-white/10 p-2 text-white/50 transition hover:border-gold/30 hover:text-white"
            aria-label={t("later")}
          >
            <IconClose size={18} />
          </button>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
            <TimeCapsuleVisual size={100} sealed={false} className="motion-safe:growth-capsule-float shrink-0" />
            <div className="text-center sm:text-start">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                <IconCapsule size={14} className="text-gold" />
                TENEGTA ASCEND
              </div>
              <h2 id="capsule-title" className="font-[family-name:var(--font-cairo)] text-2xl font-bold text-gold">
                {t("writeTitle")}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-white/65 sm:justify-start">
                <IconCalendar size={16} className="shrink-0 text-gold/80" />
                {t("writeHint", { date: openDateLabel })}
              </p>
            </div>
          </div>
        </div>

        <form action={createTimeCapsuleFormAction} className="space-y-5 p-6 sm:p-8" onSubmit={() => onClose()}>
          <div>
            <label htmlFor="capsule-message" className="text-xs font-semibold uppercase tracking-wide text-white/50">
              {t("placeholder")}
            </label>
            <textarea
              id="capsule-message"
              name="message"
              maxLength={500}
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("placeholder")}
              className="mt-2 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white outline-none transition focus:border-gold/45 focus:ring-2 focus:ring-gold/15"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-white/45">
              <span>{message.length}/500</span>
              <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gold/70 transition-all" style={{ width: `${charPct}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-xs font-semibold text-gold">{t("goalDeals")} / {t("goalLevel")} / {t("goalEarnings")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-white/60">
                {t("goalDeals")}
                <input
                  name="dealsGoal"
                  type="number"
                  min={0}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0c14] px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
                />
              </label>
              <label className="text-xs text-white/60">
                {t("goalLevel")}
                <select
                  name="levelGoal"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0c14] px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
                >
                  <option value="">{t("goalLevelAny")}</option>
                  {["hunter", "closer", "pro", "elite", "titan", "legend"].map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-white/60">
                {t("goalEarnings")}
                <input
                  name="earningsGoal"
                  type="number"
                  min={0}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0c14] px-3 py-2.5 text-sm text-white outline-none focus:border-gold/40"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <GoldButton type="submit" className="w-full sm:w-auto">
              {t("send")}
            </GoldButton>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-xs font-semibold text-white/55 transition hover:text-white"
            >
              {t("later")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
