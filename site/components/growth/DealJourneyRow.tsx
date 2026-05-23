"use client";

import { useLocale } from "next-intl";
import { DealStatus } from "@prisma/client";
import type { DealJourneyStep } from "@/lib/growth/deal-journey";
import { relativeDate } from "@/lib/growth/relative-date";

type Props = {
  status: DealStatus;
  steps: DealJourneyStep[];
  labels: Record<DealJourneyStep["key"], string>;
  lostLabel: string;
};

function StepChip({
  label,
  step,
  lost,
}: {
  label: string;
  step: DealJourneyStep;
  lost?: boolean;
}) {
  const locale = useLocale();
  const when = step.at ? relativeDate(step.at, locale) : null;
  const cls = lost
    ? step.current
      ? "bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/40"
      : step.done
        ? "bg-white/10 text-white/55"
        : "bg-white/[0.04] text-white/35"
    : step.current
      ? "bg-gold/20 text-gold ring-1 ring-gold/35"
      : step.done
        ? "bg-emerald-500/15 text-emerald-100/90"
        : "bg-white/[0.04] text-white/35";
  return (
    <span className={`inline-flex flex-col rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <span>{label}</span>
      {when ? <span className="font-normal opacity-70">{when}</span> : null}
    </span>
  );
}

export function DealJourneyRow({ status, steps, labels, lostLabel }: Props) {
  if (status === DealStatus.LOST) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {steps.map((s) => (
            <StepChip key={s.key} label={labels[s.key]} step={s} lost={s.current} />
          ))}
        </div>
        <div className="text-[10px] font-semibold text-rose-200/90">{lostLabel}</div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {steps.map((s) => (
        <StepChip key={s.key} label={labels[s.key]} step={s} />
      ))}
    </div>
  );
}
