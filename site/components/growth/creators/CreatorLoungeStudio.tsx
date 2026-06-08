"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import {
  IconCopy,
  IconExternalLink,
  IconKit,
  IconShare,
} from "@/components/growth/icons/GrowthIcons";
import { CreatorContentCalendar } from "./CreatorContentCalendar";
import { CreatorSalesGuidePanel } from "./CreatorSalesGuidePanel";
import { useToast } from "@/hooks/useToast";

type Props = {
  publicSlug: string | null;
  plannedDays?: string[];
  clientDiscountCode?: string | null;
  commissionPercent?: string;
  salesProducts?: Array<{ slug: string; name: string; priceCents: number }>;
};

export function CreatorLoungeStudio({
  publicSlug,
  plannedDays,
  clientDiscountCode = null,
  commissionPercent = "10%",
  salesProducts = [],
}: Props) {
  const t = useTranslations("Growth.creators");
  const locale = useLocale();
  const { showToast } = useToast();

  const studioUrl = `https://tenegta.com/${locale}/creators/studio?utm_source=creator&utm_campaign=arena`;
  const inviteSlug = publicSlug ?? "demo";

  const toolLinks = [
    { href: `/creators/studio`, label: t("kit.studio"), icon: IconKit },
    { href: `/invite/${inviteSlug}`, label: t("kit.invite"), external: true, icon: IconShare },
    { href: `/${locale}?demo=ai`, label: t("kit.visualizer"), icon: IconExternalLink },
    { href: `/growth/settings`, label: t("kit.profile"), icon: IconKit },
  ] as const;

  const resources = [
    { href: "/growth/settings", label: t("lounge.resources.brand") },
    { href: "/creators/studio", label: t("lounge.resources.utm") },
    { href: "/growth/events", label: t("lounge.resources.hashtags") },
  ] as const;

  async function copyUtmLink() {
    try {
      await navigator.clipboard.writeText(studioUrl);
      showToast({ type: "success", title: t("kit.linkCopied") });
    } catch {
      showToast({ type: "error", title: t("kit.copyError") });
    }
  }

  return (
    <div className="space-y-4">
      {salesProducts.length > 0 ? (
        <CreatorSalesGuidePanel
          clientDiscountCode={clientDiscountCode}
          commissionPercent={commissionPercent}
          products={salesProducts}
        />
      ) : null}

      <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
          {t("lounge.studioTitle")}
        </h2>
        <p className="mt-1 text-xs text-white/55">{t("lounge.studioSubtitle")}</p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {toolLinks.map((link) => {
            const Icon = link.icon;
            const className =
              "flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-gold transition hover:border-gold/40";
            return (
              <li key={link.href}>
                {"external" in link && link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                    <Icon size={16} />
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className={className}>
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
          <p className="text-xs font-semibold text-white/70">{t("lounge.utmTitle")}</p>
          <p className="mt-1 break-all font-mono text-[10px] text-white/45">{studioUrl}</p>
          <GoldButton type="button" className="mt-3 text-xs" onClick={() => void copyUtmLink()}>
            <span className="inline-flex items-center gap-2">
              <IconCopy size={14} />
              {t("kit.copyStudioLink")}
            </span>
          </GoldButton>
        </div>

        <p className="mt-4 text-[11px] text-white/50">{t("kit.hashtags")}</p>
      </GlassCard>

      <CreatorContentCalendar plannedDays={plannedDays} />

      <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
          {t("lounge.resourcesTitle")}
        </h3>
        <ul className="mt-3 space-y-2">
          {resources.map((res) => (
            <li key={res.href}>
              <Link
                href={res.href}
                className="block rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/35"
              >
                {res.label}
              </Link>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
