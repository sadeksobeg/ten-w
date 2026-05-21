import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function GrowthPageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
      <div>
        <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
