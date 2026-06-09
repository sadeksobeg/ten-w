"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconYoutube, IconInstagram, IconTiktok, IconXPlatform, IconFacebook, IconWhatsapp, IconQr, IconExternalLink } from "@/components/growth/icons/GrowthIcons";
import { CreatorSalesGuidePanel } from "./CreatorSalesGuidePanel";
import { CreatorReferralProof } from "./CreatorReferralProof";
import { useToast } from "@/hooks/useToast";
import { drawLineChart } from "@/lib/growth/canvas-chart";
import type { CreatorReferralRow } from "@/lib/growth/creator-arena";

type Props = {
  clientDiscountCode: string | null;
  commissionPercent: string;
  salesProducts: Array<{ slug: string; name: string; priceCents: number }>;
  viewerName: string;
  utmWeeklySeries: Array<{ label: string; clicks: number }>;
  referralProof: { rows: CreatorReferralRow[]; totalCents: number };
  utmClicks: number;
  utmRegistrations: number;
};

const PLATFORMS = [
  { key: "youtube", Icon: IconYoutube },
  { key: "instagram", Icon: IconInstagram },
  { key: "tiktok", Icon: IconTiktok },
  { key: "facebook", Icon: IconFacebook },
  { key: "x", Icon: IconXPlatform },
  { key: "whatsapp", Icon: IconWhatsapp },
] as const;

const WEEKLY_IDEAS = [
  { platform: "youtube", titleKey: "idea1" },
  { platform: "instagram", titleKey: "idea2" },
  { platform: "tiktok", titleKey: "idea3" },
  { platform: "x", titleKey: "idea4" },
  { platform: "youtube", titleKey: "idea5" },
] as const;

export function CreatorKitSection({
  clientDiscountCode,
  commissionPercent,
  salesProducts,
  viewerName,
  utmWeeklySeries,
  referralProof,
  utmClicks,
  utmRegistrations,
}: Props) {
  const t = useTranslations("Creators.kit");
  const locale = useLocale();
  const { showToast } = useToast();
  const [platform, setPlatform] = useState("instagram");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const code = clientDiscountCode ?? "TENEGTA";

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas || utmWeeklySeries.length < 2) return;
    drawLineChart(
      canvas,
      utmWeeklySeries.map((p) => ({ label: p.label, value: p.clicks })),
      { strokeColor: "#E11D48" },
    );
  }, [utmWeeklySeries]);

  const utmUrl = `https://tenegta.com/${locale}/contact?code=${encodeURIComponent(code)}&utm_source=${platform}&utm_medium=creator&utm_campaign=creator-${encodeURIComponent(viewerName.slice(0, 12))}`;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ type: "success", title: t("copied") });
    } catch {
      showToast({ type: "error", title: t("copyError") });
    }
  }

  return (
    <div className="space-y-4">
      {salesProducts.length > 0 ? (
        <CreatorSalesGuidePanel clientDiscountCode={clientDiscountCode} commissionPercent={commissionPercent} products={salesProducts} />
      ) : null}

      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("utmTitle")}</h2>
        <p className="mt-1 text-xs text-white/55">{t("utmSubtitle")}</p>
        <div className="creator-platform-scroll mt-4">
          {PLATFORMS.map(({ key, Icon }) => (
            <button key={key} type="button" onClick={() => setPlatform(key)} className={`creator-platform-chip flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold ${platform === key ? "bg-[var(--creator-primary)] text-white" : "border border-white/15 text-white/60"}`}>
              <Icon size={12} />
              {t(`platform.${key}`)}
            </button>
          ))}
        </div>
        <p className="mt-4 break-all rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[10px] text-white/60">{utmUrl}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <GoldButton type="button" className="text-xs" onClick={() => void copy(utmUrl)}>{t("copyLink")}</GoldButton>
          <a href={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(utmUrl)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/80">
            <IconQr size={14} />
            {t("qr")}
          </a>
        </div>
      </GlassCard>

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("scriptsTitle")}</h3>
        <p className="mt-2 rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-white/70">{t("scriptInstagram", { code })}</p>
        <GoldButton type="button" className="mt-2 text-xs" onClick={() => void copy(t("scriptInstagram", { code }))}>{t("copyScript")}</GoldButton>
      </GlassCard>

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("ideasTitle")}</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {WEEKLY_IDEAS.map((idea, i) => (
            <li key={i} className="rounded-xl border border-white/10 p-3 text-xs text-white/75">
              {t(idea.titleKey)}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("utmChartTitle")}</h3>
        <canvas ref={chartRef} width={640} height={180} className="mt-3 w-full rounded-xl bg-black/20" />
        <p className="mt-3 text-xs text-white/50">
          {t("funnel", { clicks: utmClicks, regs: utmRegistrations, deals: Math.max(0, Math.floor(utmRegistrations * 0.15)) })}
        </p>
      </GlassCard>

      <CreatorReferralProof rows={referralProof.rows} totalCents={referralProof.totalCents} />

      <GlassCard className="creator-card p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">{t("assetsTitle")}</h3>
        <ul className="mt-3 space-y-2">
          <li>
            <Link href="/brand/tenegta-logo.svg" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--creator-secondary)]">
              <IconExternalLink size={14} />
              {t("assetLogo")}
            </Link>
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
