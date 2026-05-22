import type { ReactNode } from "react";
import { GoldButton } from "@/components/growth/ui/GoldButton";

export type EmptyIllustration = "rocket" | "trophy" | "calendar" | "chat" | "refresh";

type LegacyProps = {
  illustration: EmptyIllustration;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: ReactNode;
};

type ModernProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
};

type Props = LegacyProps | ModernProps;

function isModern(p: Props): p is ModernProps {
  return "icon" in p && "title" in p;
}

function Illustration({ kind }: { kind: EmptyIllustration }) {
  const stroke = "var(--growth-gold)";
  switch (kind) {
    case "rocket":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path
            d="M40 8L48 32H64L52 44L56 68L40 56L24 68L28 44L16 32H32L40 8Z"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="40" cy="28" r="4" fill={stroke} opacity="0.5" />
        </svg>
      );
    case "trophy":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path
            d="M24 24h32v8c0 12-8 20-16 20s-16-8-16-20v-8zm0 0H16v6c0 8 6 14 14 14m24-20h8v6c0 8-6 14-14 14M32 52h16v8H32v-8z"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          <rect x="16" y="20" width="48" height="44" rx="4" stroke={stroke} strokeWidth="2" />
          <path d="M16 32h48M28 12v12M52 12v12" stroke={stroke} strokeWidth="2" />
          <path d="M40 44l4 4 8-8" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case "chat":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path
            d="M16 20h40a8 8 0 018 8v20a8 8 0 01-8 8H36l-12 12V28a8 8 0 018-8z"
            stroke={stroke}
            strokeWidth="2"
          />
          <circle cx="32" cy="36" r="2" fill={stroke} />
          <circle cx="40" cy="36" r="2" fill={stroke} />
          <circle cx="48" cy="36" r="2" fill={stroke} />
        </svg>
      );
    case "refresh":
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
          <path
            d="M48 16a20 20 0 10-14 34M32 64a20 20 0 1014-34"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M48 8v8h8M32 72v-8h-8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function EmptyState(props: Props) {
  if (isModern(props)) {
    const { icon, title, subtitle, action, children } = props;
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5 text-gold">
          {icon}
        </div>
        <p className="mt-4 text-base font-semibold text-[var(--growth-text)]">{title}</p>
        {subtitle ? (
          <p className="mt-1 max-w-sm text-sm text-[var(--growth-text-sub)]">{subtitle}</p>
        ) : null}
        {children}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    );
  }

  const { illustration, message, actionLabel, onAction, actionHref, children } = props;
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Illustration kind={illustration} />
      <p className="mt-4 max-w-sm text-sm text-[var(--growth-text-sub)]">{message}</p>
      {children}
      {actionLabel && onAction ? (
        <GoldButton className="mt-4" onClick={onAction}>
          {actionLabel}
        </GoldButton>
      ) : null}
      {actionLabel && actionHref ? (
        <a href={actionHref} className="mt-4 inline-block">
          <GoldButton>{actionLabel}</GoldButton>
        </a>
      ) : null}
    </div>
  );
}
