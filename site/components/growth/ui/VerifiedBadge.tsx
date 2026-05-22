import { IconCheck } from "@/components/growth/icons/GrowthIcons";

type Props = {
  label?: string;
  className?: string;
};

export function VerifiedBadge({ label, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border border-sky-400/40 bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-200 ${className}`}
    >
      <IconCheck size={10} className="text-sky-300" aria-hidden />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
