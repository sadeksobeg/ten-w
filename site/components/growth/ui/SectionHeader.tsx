import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, subtitle, action, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-[var(--growth-text)] sm:text-xl">
          {title}
        </h2>
        <div
          className="mt-2 h-[3px] w-10 rounded-full bg-[var(--growth-gold)]"
          aria-hidden
        />
        {subtitle ? (
          <p className="mt-2 text-sm text-[var(--growth-text-sub)]">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
