import { IconCheck } from "@/components/growth/icons/GrowthIcons";

type Props = {
  label?: string;
  className?: string;
  variant?: "sky" | "gold";
};

export function VerifiedBadge({ label, className = "", variant = "gold" }: Props) {
  const tone =
    variant === "gold"
      ? "border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-yellow-500/15 text-amber-100 shadow-[0_0_12px_rgba(234,179,8,0.25)]"
      : "border-sky-400/40 bg-sky-500/15 text-sky-200";
  const iconTone = variant === "gold" ? "text-amber-300" : "text-sky-300";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${tone} ${className}`}
      title={label}
    >
      <IconCheck size={10} className={iconTone} aria-hidden />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
