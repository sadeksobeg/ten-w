"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createTimeCapsuleFormAction } from "@/lib/growth/engagement-actions";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = {
  open: boolean;
  onClose: () => void;
  openDateLabel: string;
};

export function TimeCapsuleModal({ open, onClose, openDateLabel }: Props) {
  const t = useTranslations("Growth.capsule");
  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="w-full max-w-lg rounded-2xl border border-gold/30 bg-[#0a0c14] p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="capsule-title"
      >
        <h2 id="capsule-title" className="font-[family-name:var(--font-cairo)] text-xl font-bold text-gold">
          {t("writeTitle")}
        </h2>
        <p className="mt-2 text-sm text-white/65">{t("writeHint", { date: openDateLabel })}</p>
        <form action={createTimeCapsuleFormAction} className="mt-4 space-y-4" onSubmit={() => onClose()}>
          <textarea
            name="message"
            maxLength={500}
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-gold/50"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-white/60">
              {t("goalDeals")}
              <input
                name="dealsGoal"
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-xs text-white/60">
              {t("goalLevel")}
              <select
                name="levelGoal"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
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
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <GoldButton type="submit">{t("send")}</GoldButton>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs text-white/60 hover:text-white"
            >
              {t("later")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
