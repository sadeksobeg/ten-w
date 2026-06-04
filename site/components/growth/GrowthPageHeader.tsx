import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "feature";
};

export function GrowthPageHeader({
  title,
  subtitle,
  action,
  icon,
  variant = "default",
}: Props) {
  if (variant === "feature") {
    return (
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/[0.12] via-[#0c101c] to-violet-950/30 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-gold/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -start-10 size-40 rounded-full bg-violet-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {icon ? (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-[0_0_32px_-8px_rgba(228,184,77,0.55)]">
                {icon}
              </span>
            ) : null}
            <div>
              <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-gold sm:text-3xl">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 max-w-xl text-sm text-white/60">{subtitle}</p> : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
