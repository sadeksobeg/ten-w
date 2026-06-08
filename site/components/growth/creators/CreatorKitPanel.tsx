"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { useToast } from "@/hooks/useToast";

type Props = {
  publicSlug: string | null;
};

export function CreatorKitPanel({ publicSlug }: Props) {
  const t = useTranslations("Growth.creators");
  const locale = useLocale();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const studioUrl = `https://tenegta.com/${locale}/creators/studio?utm_source=creator&utm_campaign=arena`;
  const inviteSlug = publicSlug ?? "demo";
  const filmLinks = [
    { href: `/creators/studio`, label: t("kit.studio") },
    { href: `/demo/cinema?presenter=1`, label: t("kit.cinema") },
    { href: `/invite/${inviteSlug}`, label: t("kit.invite"), external: true },
    { href: `/${locale}?demo=ai`, label: t("kit.visualizer") },
  ] as const;

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(t("kit.scriptBody"));
      setCopied(true);
      showToast({ type: "success", title: t("kit.scriptCopied") });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: "error", title: t("kit.copyError") });
    }
  }

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

      <div className="mt-4 rounded-xl border border-gold/20 bg-black/30 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
          {t("kit.scriptLabel")}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
          {t("kit.scriptBody")}
        </p>
        <GoldButton type="button" className="mt-3" onClick={() => void copyScript()}>
          {copied ? t("kit.scriptCopied") : t("kit.copyScript")}
        </GoldButton>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-white/70">{t("kit.filmLinks")}</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {filmLinks.map((link) => (
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

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/50">
        <span>#TENEGTA</span>
        <span>#Ascend</span>
        <span>#صعود</span>
      </div>

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
