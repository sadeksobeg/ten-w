import { DealStatus } from "@prisma/client";
import type { DealJourneyStep } from "@/lib/growth/deal-journey";

type Props = {
  status: DealStatus;
  steps: DealJourneyStep[];
  labels: Record<DealJourneyStep["key"], string>;
  lostLabel: string;
};

export function DealJourneyRow({ status, steps, labels, lostLabel }: Props) {
  if (status === DealStatus.LOST) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {steps.map((s) => (
            <span
              key={s.key}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                s.current
                  ? "bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/40"
                  : s.done
                    ? "bg-white/10 text-white/55"
                    : "bg-white/[0.04] text-white/35"
              }`}
            >
              {labels[s.key]}
            </span>
          ))}
        </div>
        <div className="text-[10px] font-semibold text-rose-200/90">{lostLabel}</div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {steps.map((s) => (
        <span
          key={s.key}
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
            s.current
              ? "bg-gold/20 text-gold ring-1 ring-gold/35"
              : s.done
                ? "bg-emerald-500/15 text-emerald-100/90"
                : "bg-white/[0.04] text-white/35"
          }`}
        >
          {labels[s.key]}
        </span>
      ))}
    </div>
  );
}
