"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconCheck } from "@/components/growth/icons/GrowthIcons";
import type { CreatorLoungeSection } from "./CreatorLoungeLayout";

export type CreatorOnboardingProgress = {
  profile: boolean;
  introduce: boolean;
  challenge: boolean;
  firstShare: boolean;
};

type Props = {
  progress: CreatorOnboardingProgress;
  onNavigate?: (section: CreatorLoungeSection) => void;
};

const STEPS: { key: keyof CreatorOnboardingProgress; section?: CreatorLoungeSection }[] = [
  { key: "profile" },
  { key: "introduce", section: "chat" },
  { key: "challenge", section: "challenge" },
  { key: "firstShare", section: "toolkit" },
];

export function CreatorOnboardingChecklist({ progress, onNavigate }: Props) {
  const t = useTranslations("Growth.creators.onboarding");
  const doneCount = STEPS.filter((s) => progress[s.key]).length;
  const allDone = doneCount === STEPS.length;

  if (allDone) return null;

  return (
    <GlassCard className="border border-emerald-500/20 bg-emerald-500/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
            {t("title")}
          </h3>
          <p className="mt-1 text-xs text-white/55">{t("subtitle")}</p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
          {doneCount}/{STEPS.length}
        </span>
      </div>

      <ol className="mt-4 space-y-2">
        {STEPS.map((step, i) => {
          const done = progress[step.key];
          const label = t(`steps.${step.key}`);

          const content = (
            <div
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                done
                  ? "border-emerald-500/25 bg-emerald-500/10"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? "bg-emerald-500/25 text-emerald-200" : "bg-white/10 text-white/40"
                }`}
              >
                {done ? <IconCheck size={12} /> : i + 1}
              </span>
              <span className={`text-xs font-semibold ${done ? "text-emerald-100" : "text-white/75"}`}>
                {label}
              </span>
              {done ? (
                <span className="ms-auto text-[9px] font-bold uppercase text-emerald-300/80">
                  {t("complete")}
                </span>
              ) : null}
            </div>
          );

          if (!done && step.section && onNavigate) {
            return (
              <li key={step.key}>
                <button
                  type="button"
                  className="w-full text-start transition hover:opacity-90"
                  onClick={() => onNavigate(step.section!)}
                >
                  {content}
                </button>
              </li>
            );
          }

          if (!done && step.key === "profile") {
            return (
              <li key={step.key}>
                <Link href="/growth/settings" className="block transition hover:opacity-90">
                  {content}
                </Link>
              </li>
            );
          }

          return <li key={step.key}>{content}</li>;
        })}
      </ol>
    </GlassCard>
  );
}
