"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { completeOnboardingStepFormAction } from "@/lib/growth/actions";

type Props = {
  locale: string;
  data: DashboardData;
  userId: string;
};

type Step = { key: string; done: boolean; href?: string };

export function PartnerOnboardingChecklist({ data }: Props) {
  const t = useTranslations("Growth.onboarding");
  const saved = data.profile.onboardingSteps ?? {};

  const steps: Step[] = [
    { key: "profile", done: Boolean(data.profile.levelName), href: "/growth/settings" },
    { key: "firstLead", done: data.deals.length > 0 || Boolean(saved.firstLead), href: "/growth/deals" },
    { key: "firstClose", done: data.closedDeals > 0 || Boolean(saved.firstClose) },
    { key: "network", done: data.network.length > 0 || Boolean(saved.network), href: "/growth/network" },
    { key: "kit", done: Boolean(saved.kit), href: "/growth/kit" },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount >= steps.length) return null;

  return (
    <section className="rounded-2xl border border-gold/25 bg-gold/5 p-5">
      <h2 className="text-sm font-bold text-gold">{t("title")}</h2>
      <p className="mt-1 text-xs text-white/60">
        {t("progress", { done: doneCount, total: steps.length })}
      </p>
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2 text-sm">
            <span className={s.done ? "text-emerald-400" : "text-white/80"}>
              {s.done ? "✓ " : "○ "}
              {t(`steps.${s.key}`)}
            </span>
            {!s.done && s.href ? (
              <Link href={s.href} className="text-xs font-semibold text-gold hover:underline">
                {t("go")}
              </Link>
            ) : !s.done ? (
              <form action={completeOnboardingStepFormAction}>
                <input type="hidden" name="step" value={s.key} />
                <button type="submit" className="text-xs text-white/50 hover:text-gold">
                  {t("markDone")}
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
