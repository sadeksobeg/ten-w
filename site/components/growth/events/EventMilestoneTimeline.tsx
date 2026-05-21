type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  requiredProgress: number;
  xpReward: number;
  reached: boolean;
};

type Props = {
  milestones: Milestone[];
  currentProgress: number;
  locale: string;
};

export function EventMilestoneTimeline({ milestones, currentProgress, locale }: Props) {
  const sorted = [...milestones].sort((a, b) => a.requiredProgress - b.requiredProgress);
  const max = sorted[sorted.length - 1]?.requiredProgress ?? 100;
  const fillPct = Math.min(100, (currentProgress / Math.max(1, max)) * 100);

  return (
    <div className="relative ps-8">
      <div
        className="absolute bottom-0 start-3 top-0 w-0.5 bg-white/10"
        aria-hidden
      />
      <div
        className="absolute start-3 top-0 w-0.5 bg-gold transition-[height] duration-500"
        style={{ height: `${fillPct}%` }}
        aria-hidden
      />
      <ul className="space-y-8">
        {sorted.map((m, i) => {
          const reached = currentProgress >= m.requiredProgress;
          const locked = !reached;
          return (
            <li key={m.id} className="relative">
              <span
                className={`absolute -start-8 flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  reached
                    ? "border-gold bg-gold/20 text-gold"
                    : "border-white/20 bg-[var(--growth-surface)] text-white/40"
                }`}
              >
                {reached ? "✓" : i + 1}
              </span>
              <h4 className="font-bold">{m.title}</h4>
              <p className="text-xs text-[var(--growth-text-sub)]">
                {m.requiredProgress}% · +{m.xpReward} XP
              </p>
              {m.description ? (
                <p className="mt-1 text-sm text-[var(--growth-text-sub)]">{m.description}</p>
              ) : null}
              {locked ? (
                <span className="mt-1 inline-block text-xs text-white/40">
                  🔒 {locale === "ar" ? "مقفلة" : "Locked"}
                </span>
              ) : (
                <span className="mt-1 inline-block text-xs text-emerald-400">
                  ✓ {locale === "ar" ? "مكتملة" : "Complete"}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
