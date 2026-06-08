"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";

type Props = {
  clientDiscountCode?: string | null;
};

export function CreatorKitPanel({ clientDiscountCode = null }: Props) {
  const t = useTranslations("Growth.creators");

  const contactHref = clientDiscountCode
    ? `/contact?code=${encodeURIComponent(clientDiscountCode)}`
    : "/contact";

  const toolLinks = [
    { href: contactHref, label: t("kit.contactPage") },
    { href: "/growth/creators", label: t("kit.lounge") },
    { href: "/growth/settings", label: t("kit.profile") },
  ] as const;

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {t("kitTitle")}
      </h2>
      <p className="mt-1 text-xs text-white/55">{t("kitSubtitle")}</p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {toolLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block min-h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-gold hover:border-gold/40"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] text-white/50">{t("kit.hashtags")}</p>
    </GlassCard>
  );
}
