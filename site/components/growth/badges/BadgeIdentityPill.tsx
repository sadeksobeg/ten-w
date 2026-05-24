import { IconCheck } from "@/components/growth/icons/GrowthIcons";

type Variant = "verified" | "creator";

const STYLES: Record<Variant, { bg: string; labelAr: string; labelEn: string; labelFr: string }> = {
  verified: {
    bg: "linear-gradient(135deg, #B07D2B, #E4B84D)",
    labelAr: "موثّق",
    labelEn: "Verified",
    labelFr: "Vérifié",
  },
  creator: {
    bg: "linear-gradient(135deg, #FF6B6B, #DC2626)",
    labelAr: "صانع محتوى",
    labelEn: "Creator",
    labelFr: "Créateur",
  },
};

type Props = {
  variant: Variant;
  locale: string;
  size?: "sm" | "md";
};

export function BadgeIdentityPill({ variant, locale, size = "sm" }: Props) {
  const s = STYLES[variant];
  const label = locale === "ar" ? s.labelAr : locale === "fr" ? s.labelFr : s.labelEn;
  const textSize = size === "md" ? "text-xs" : "text-[10px]";
  const pad = size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold text-black ${textSize} ${pad}`}
      style={{ background: s.bg }}
    >
      <IconCheck size={size === "md" ? 12 : 10} aria-hidden />
      {label}
    </span>
  );
}
