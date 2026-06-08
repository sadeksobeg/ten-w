"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import {
  IconDashboard,
  IconExternalLink,
  IconKit,
  IconSettings,
} from "@/components/growth/icons/GrowthIcons";
import { CreatorSalesGuidePanel } from "./CreatorSalesGuidePanel";

type Props = {
  clientDiscountCode?: string | null;
  commissionPercent?: string;
  salesProducts?: Array<{ slug: string; name: string; priceCents: number }>;
};

export function CreatorLoungeStudio({
  clientDiscountCode = null,
  commissionPercent = "10%",
  salesProducts = [],
}: Props) {
  const t = useTranslations("Growth.creators");

  const orderHref = clientDiscountCode
    ? `/order?code=${encodeURIComponent(clientDiscountCode)}`
    : "/order";

  const quickLinks = [
    { href: orderHref, label: t("kit.orderPage"), icon: IconExternalLink, highlight: true },
    { href: "/creators/studio", label: t("kit.studio"), icon: IconKit, highlight: false },
    { href: "/growth/creators", label: t("kit.lounge"), icon: IconDashboard, highlight: false },
    { href: "/growth/settings", label: t("kit.profile"), icon: IconSettings, highlight: false },
  ];

  return (
    <div className="space-y-4">
      {salesProducts.length > 0 ? (
        <CreatorSalesGuidePanel
          clientDiscountCode={clientDiscountCode}
          commissionPercent={commissionPercent}
          products={salesProducts}
        />
      ) : null}

      <GlassCard className="border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white sm:text-lg">
          {t("lounge.studioTitle")}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-white/55">{t("lounge.studioSubtitle")}</p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-3 text-xs font-semibold transition sm:min-h-11 sm:py-2.5 ${
                    link.highlight
                      ? "border-gold/35 bg-gold/10 text-gold hover:border-gold/50"
                      : "border-white/10 bg-white/[0.04] text-white/85 hover:border-gold/35 hover:text-gold"
                  }`}
                >
                  <Icon size={16} className={link.highlight ? "text-gold" : "text-white/50"} />
                  <span className="leading-snug">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 rounded-lg border border-white/8 bg-black/20 px-3 py-2.5 text-[11px] leading-relaxed text-white/50">
          {t("lounge.studioHint")}
        </p>
        <p className="mt-3 text-[11px] text-white/40">{t("kit.hashtags")}</p>
      </GlassCard>
    </div>
  );
}
