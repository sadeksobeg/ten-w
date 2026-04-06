import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-bg hover:bg-gold-bright focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  secondary:
    "border border-gold/60 text-gold hover:bg-gold-dim focus-visible:ring-2 focus-visible:ring-gold",
  ghost: "text-foreground hover:text-gold hover:bg-gold-dim/40",
};

type Props = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
