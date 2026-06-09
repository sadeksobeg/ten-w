import { IconCheck } from "@/components/growth/icons/GrowthIcons";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 14, md: 16, lg: 18 };
const CHECK_PX: Record<Size, number> = { sm: 8, md: 9, lg: 10 };

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
  const dim = SIZE_PX[size];

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`creator-consent-verified-badge inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.4)] ring-1 ring-amber-200/40 ${muted ? "opacity-45 grayscale-[0.2]" : ""} ${className}`}
      style={{ width: dim, height: dim }}
    >
      <IconCheck size={CHECK_PX[size]} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" />
    </span>
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
    <span className={`inline-flex max-w-full items-center gap-1 ${className}`}>
      <span className={`truncate ${nameClassName}`}>{name}</span>
      {verified ? <CreatorConsentVerifiedBadge label={label} size={badgeSize} /> : null}
    </span>
  );
}
