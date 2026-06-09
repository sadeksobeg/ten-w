"use client";

import { useId } from "react";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 16, md: 18, lg: 22 };

type Props = {
  label: string;
  size?: Size;
  className?: string;
  muted?: boolean;
};

export function CreatorConsentVerifiedBadge({
  label,
  size = "sm",
  className = "",
  muted = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const gradId = `cv-grad-${uid}`;
  const glowId = `cv-glow-${uid}`;
  const dim = SIZE_PX[size];

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 22 22"
      role="img"
      aria-label={label}
      className={`creator-consent-verified-badge shrink-0 ${muted ? "opacity-40" : ""} ${className}`}
    >
      <title>{label}</title>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="35%" stopColor="#F5C451" />
          <stop offset="70%" stopColor="#E8A317" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.1" floodColor="#F5C451" floodOpacity="0.65" />
        </filter>
      </defs>
      <circle
        cx="11"
        cy="11"
        r="9.8"
        fill={`url(#${gradId})`}
        filter={`url(#${glowId})`}
        stroke="rgba(255,248,225,0.55)"
        strokeWidth="0.45"
      />
      <path
        d="M6.4 11.1l2.35 2.35 6.85-6.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type NameProps = {
  name: string;
  verified: boolean;
  label: string;
  className?: string;
  nameClassName?: string;
  badgeSize?: Size;
};

export function CreatorNameWithConsentBadge({
  name,
  verified,
  label,
  className = "",
  nameClassName = "",
  badgeSize = "sm",
}: NameProps) {
  return (
    <span className={`inline-flex max-w-full min-w-0 items-center gap-1.5 ${className}`}>
      <span className={`min-w-0 truncate ${nameClassName}`}>{name}</span>
      {verified ? (
        <CreatorConsentVerifiedBadge label={label} size={badgeSize} className="translate-y-px" />
      ) : null}
    </span>
  );
}
