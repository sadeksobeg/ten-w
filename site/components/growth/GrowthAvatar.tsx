"use client";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "size-8 text-[10px]",
  md: "size-11 text-xs",
  lg: "size-16 text-sm",
};

function initials(name: string | null | undefined, email: string): string {
  const base = (name?.trim() || email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

function hueFromSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
}

type Props = {
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
  size?: Size;
  className?: string;
};

export function GrowthAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
  className = "",
}: Props) {
  const label = initials(name, email);
  const hue = hueFromSeed(email.toLowerCase());
  const ring = "ring-2 ring-gold/35 ring-offset-2 ring-offset-[#050816]";

  if (avatarUrl?.trim()) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${sizeMap[size]} shrink-0 rounded-full object-cover ${ring} ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`${sizeMap[size]} flex shrink-0 items-center justify-center rounded-full font-black text-white ${ring} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 62% 42%), hsl(${(hue + 40) % 360} 70% 55%))`,
      }}
    >
      {label}
    </div>
  );
}
