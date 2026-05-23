"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { dailyCheckInAction } from "@/lib/growth/actions";
import { useToast } from "@/hooks/useToast";

type Props = {
  available: boolean;
  totalCheckIns: number;
};

export function DailyCheckIn({ available, totalCheckIns }: Props) {
  const t = useTranslations("Growth.checkIn");
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState(dailyCheckInAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      showToast({
        type: "success",
        title: t("success", { xp: state.xp, days: state.totalDays }),
      });
    } else if (state.error !== "already_checked_in") {
      showToast({ type: "error", title: t(`errors.${state.error}` as "errors.rate_limited") });
    }
  }, [state, showToast, t]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white">{t("title")}</h2>
          <p className="mt-1 text-xs text-white/55">
            {available ? t("subtitle") : t("doneToday")}
          </p>
          <p className="mt-1 text-[11px] text-white/40">{t("totalDays", { n: totalCheckIns })}</p>
        </div>
        <form action={formAction}>
          <button
            type="submit"
            disabled={!available || pending}
            className="rounded-xl bg-gradient-to-r from-gold/30 via-gold to-gold-bright px-5 py-2.5 text-sm font-extrabold text-bg disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pending ? t("checking") : available ? t("cta") : t("checked")}
          </button>
        </form>
      </div>
    </div>
  );
}
