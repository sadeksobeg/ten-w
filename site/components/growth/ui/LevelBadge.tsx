import { getLevelVisual } from "@/lib/growth/level-visual";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  levelName: string;
  size?: Size;
  className?: string;
};

const sizeClass: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
  xl: "px-5 py-2 text-base font-extrabold",
};

export function LevelBadge({ levelName, size = "md", className = "" }: Props) {
  const v = getLevelVisual(levelName);
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${v.pillClass} ${sizeClass[size]} ${v.isLegend ? "growth-shimmer" : ""} ${className}`}
    >
      {levelName}
    </span>
  );
}
