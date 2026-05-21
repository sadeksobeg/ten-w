import type { HTMLAttributes, ReactNode } from "react";

type Variant = "default" | "elevated" | "highlight";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClass: Record<Variant, string> = {
  default: "border-[var(--growth-border)]",
  elevated: "border-[rgba(180,130,40,0.28)] shadow-[0_6px_28px_rgba(0,0,0,0.45)]",
  highlight: "border-[var(--growth-border)] border-s-[3px] border-s-[var(--growth-gold)]",
};

export function GlassCard({
  children,
  variant = "default",
  className = "",
  ...rest
}: Props) {
  return (
    <div
      className={`growth-card-hover rounded-2xl border bg-[linear-gradient(135deg,rgba(26,26,36,0.9),rgba(17,17,24,0.95))] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[12px] sm:p-6 ${variantClass[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
