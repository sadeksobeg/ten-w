import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#B07D2B,#E4B84D)] text-black font-semibold hover:brightness-110 motion-safe:hover:scale-[1.02] active:scale-[0.98]",
  ghost:
    "border border-[var(--growth-gold)]/40 bg-transparent text-[var(--growth-gold-bright)] hover:bg-[var(--growth-gold)]/10",
  danger:
    "bg-[linear-gradient(135deg,#A32D2D,#c44)] text-white font-semibold hover:brightness-110",
};

export function GoldButton({
  children,
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-[10px] px-5 py-2.5 text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
