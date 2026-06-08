"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { useToast } from "@/hooks/useToast";

type Props = {
  publicSlug: string | null;
  clientDiscountCode?: string | null;
};

export function CreatorKitPanel({ publicSlug, clientDiscountCode = null }: Props) {
  const t = useTranslations("Growth.creators");
  const locale = useLocale();
  const { showToast } = useToast();

  const studioUrl = `https://tenegta.com/${locale}/creators/studio?utm_source=creator&utm_campaign=arena`;
  const inviteSlug = publicSlug ?? "demo";
  const orderHref = clientDiscountCode
    ? `/order?code=${encodeURIComponent(clientDiscountCode)}`
    : "/order";

  const toolLinks = [
    { href: orderHref, label: t("kit.orderPage") },
    { href: `/creators/studio`, label: t("kit.studio") },
    { href: `/invite/${inviteSlug}`, label: t("kit.invite"), external: true },
    { href: `/${locale}?demo=ai`, label: t("kit.visualizer") },
    { href: `/growth/settings`, label: t("kit.profile") },
  ] as const;

  async function copyStudioLink() {
    try {
      await navigator.clipboard.writeText(studioUrl);
      showToast({ type: "success", title: t("kit.linkCopied") });
    } catch {
      showToast({ type: "error", title: t("kit.copyError") });
    }
  }

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {t("kitTitle")}
      </h2>
      <p className="mt-1 text-xs text-white/55">{t("kitSubtitle")}</p>

      <div className="mt-4">
        <p className="text-xs font-semibold text-white/70">{t("kit.toolLinks")}</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {toolLinks.map((link) => (
            <li key={link.href}>
              {"external" in link && link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gold hover:border-gold/40"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="block rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-gold hover:border-gold/40"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[11px] text-white/50">{t("kit.hashtags")}</p>

      <button
        type="button"
        onClick={() => void copyStudioLink()}
        className="mt-4 text-xs font-semibold text-gold underline-offset-4 hover:underline"
      >
        {t("kit.copyStudioLink")}
      </button>
    </GlassCard>
  );
}
