"use client";

import { useLocale, useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { useToast } from "@/hooks/useToast";

type ProductRow = {
  slug: string;
  name: string;
  priceCents: number;
};

type Props = {
  clientDiscountCode: string | null;
  commissionPercent: string;
  products: ProductRow[];
};

const SLUG_EMOJI: Record<string, string> = {
  website: "🌐",
  "automation-ai": "🤖",
  "mobile-app": "📱",
};

function formatUsd(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CreatorSalesGuidePanel({
  clientDiscountCode,
  commissionPercent,
  products,
}: Props) {
  const t = useTranslations("Growth.creators.salesGuide");
  const locale = useLocale();
  const { showToast } = useToast();

  const orderUrl = clientDiscountCode
    ? `https://tenegta.com/${locale}/order?code=${encodeURIComponent(clientDiscountCode)}`
    : null;

  async function copy(text: string, successKey: "codeCopied" | "linkCopied") {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ type: "success", title: t(successKey) });
    } catch {
      showToast({ type: "error", title: t("copyError") });
    }
  }

  return (
    <GlassCard className="relative overflow-hidden border border-gold/25 bg-gradient-to-br from-gold/10 via-transparent to-emerald-500/5 p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -top-12 end-0 h-28 w-28 rounded-full bg-gold/20 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold/80">
          {t("eyebrow")}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
          {t("title")}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/60">{t("intro")}</p>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-wide text-white/45">
                <th className="px-3 py-2 text-start font-bold">{t("colProduct")}</th>
                <th className="px-3 py-2 text-end font-bold">{t("colPrice")}</th>
                <th className="px-3 py-2 text-end font-bold">{t("colCommission")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2.5 font-semibold text-white">
                    <span className="me-1.5">{SLUG_EMOJI[p.slug] ?? "✦"}</span>
                    {p.name}
                  </td>
                  <td className="px-3 py-2.5 text-end font-bold text-gold">
                    {formatUsd(p.priceCents, locale)}
                  </td>
                  <td className="px-3 py-2.5 text-end text-emerald-200/90">
                    {commissionPercent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-white/50">{t("priceNote")}</p>
        <p className="mt-1 text-[11px] text-emerald-200/80">
          {t("commissionNote", { rate: commissionPercent })}
        </p>

        {clientDiscountCode ? (
          <div className="mt-4 space-y-3 rounded-xl border border-gold/20 bg-black/25 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gold/70">
                {t("discountTitle")}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 font-mono text-sm font-bold text-gold">
                  {clientDiscountCode}
                </code>
                <button
                  type="button"
                  onClick={() => void copy(clientDiscountCode, "codeCopied")}
                  className="text-[11px] font-semibold text-gold underline-offset-4 hover:underline"
                >
                  {t("copyCode")}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-white/45">{t("discountBody")}</p>
            </div>

            {orderUrl ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">
                  {t("orderLinkTitle")}
                </p>
                <p className="mt-1 break-all font-mono text-[10px] text-white/40">{orderUrl}</p>
                <button
                  type="button"
                  onClick={() => void copy(orderUrl, "linkCopied")}
                  className="mt-2 text-[11px] font-semibold text-gold underline-offset-4 hover:underline"
                >
                  {t("copyOrderLink")}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs text-white/45">{t("noCodeYet")}</p>
        )}
      </div>
    </GlassCard>
  );
}
