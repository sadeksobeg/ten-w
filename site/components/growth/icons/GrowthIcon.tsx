import type { ReactNode } from "react";

type IconName = "earnings" | "deals" | "rank" | "streak";

type Props = {
  name: IconName;
  className?: string;
};

const paths: Record<IconName, ReactNode> = {
  earnings: (
    <path
      d="M12 3v18M7 8h7a4 4 0 010 8H9a4 4 0 010-8h2"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
    />
  ),
  deals: (
    <path
      d="M4 7h16v12H4zM8 7V5h8v2"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
  ),
  rank: (
    <path
      d="M8 18V10l4-3 4 3v8M6 20h12"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  streak: (
    <path
      d="M12 3c2 4 6 5 6 9a6 6 0 11-12 0c0-4 4-5 6-9z"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
    />
  ),
};

export function GrowthIcon({ name, className = "size-5 text-gold" }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {paths[name]}
    </svg>
  );
}
