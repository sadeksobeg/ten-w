"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type KitV2 = {
  version?: number;
  icp?: {
    label?: string;
    ageRange?: string;
    businessType?: string;
    teamSize?: string;
  };
  painPoints?: string[];
  scripts?: {
    direct?: string;
    consultative?: string;
    whatsapp?: string;
    call?: string;
  };
  objections?: { quote: string; response: string }[];
  audience?: string[];
  pain?: string[];
  solution?: string[];
  script?: string;
};

function asKit(v: unknown): KitV2 | null {
  if (typeof v !== "object" || v === null) return null;
  return v as KitV2;
}

const tabs = ["overview", "scripts", "objections", "legacy"] as const;
type Tab = (typeof tabs)[number];

type Props = {
  locale: string;
  productName: string;
  productSlug: string;
  marketingKit: unknown;
};

export function MarketingKitProductCard({
  locale,
  productName,
  productSlug,
  marketingKit,
}: Props) {
  const t = useTranslations("Growth.kit");
  const kit = asKit(marketingKit);
  const [tab, setTab] = useState<Tab>("overview");

  const pains = useMemo(() => {
    if (!kit) return [];
    if (Array.isArray(kit.painPoints) && kit.painPoints.length) return kit.painPoints;
    return kit.pain ?? [];
  }, [kit]);

  const audience = kit?.audience ?? [];
  const solutions = kit?.solution ?? [];

  if (!kit) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="text-sm font-extrabold text-white">{productName}</div>
        <p className="mt-3 text-sm text-white/55">{t("noKit")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-sm font-extrabold text-white">{productName}</div>
      <div className="mt-3">
        <Link
          href={`/${locale}/growth/kit/${productSlug}`}
          className="inline-flex items-center rounded-full border border-gold/30 bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold transition hover:border-gold/50 hover:text-gold-bright"
        >
          {t("openPlaybook")}
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === key
                ? "bg-gold/25 text-gold"
                : "border border-white/10 bg-white/[0.04] text-white/70 hover:border-gold/25"
            }`}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="mt-5 space-y-4 text-sm text-white/75">
          {kit.icp ? (
            <div>
              <div className="text-xs font-semibold text-white/50">{t("icpTitle")}</div>
              <ul className="mt-2 list-disc space-y-1 ps-5">
                {kit.icp.label ? <li>{kit.icp.label}</li> : null}
                {kit.icp.businessType ? (
                  <li>
                    {t("icpBusiness")}: {kit.icp.businessType}
                  </li>
                ) : null}
                {kit.icp.teamSize ? (
                  <li>
                    {t("icpTeam")}: {kit.icp.teamSize}
                  </li>
                ) : null}
                {kit.icp.ageRange ? (
                  <li>
                    {t("icpAge")}: {kit.icp.ageRange}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
          <div>
            <div className="text-xs font-semibold text-white/50">{t("audience")}</div>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {audience.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-white/50">{t("pain")}</div>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {pains.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-white/50">{t("solution")}</div>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {solutions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "scripts" ? (
        <div className="mt-5 space-y-4">
          {(["direct", "consultative", "whatsapp", "call"] as const).map((k) => {
            const text = kit.scripts?.[k] ?? (k === "direct" ? kit.script : undefined);
            if (!text) return null;
            return (
              <div key={k}>
                <div className="text-xs font-semibold text-white/50">{t(`scriptLabels.${k}`)}</div>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-white/80">
                  {text}
                </pre>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === "objections" ? (
        <div className="mt-5 space-y-4">
          {(kit.objections ?? []).length === 0 ? (
            <p className="text-sm text-white/55">{t("noObjections")}</p>
          ) : (
            (kit.objections ?? []).map((o, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs font-semibold text-gold/90">{o.quote}</div>
                <div className="mt-2 text-sm text-white/75">{o.response}</div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "legacy" ? (
        <div className="mt-5 space-y-4 text-sm text-white/75">
          <div>
            <div className="text-xs font-semibold text-white/50">{t("legacyScript")}</div>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-white/75">
              {kit.script ?? ""}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
