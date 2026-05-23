"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminToastForm } from "@/components/growth/admin/AdminToastForm";
import { updateProductMarketingKitAdminAction } from "@/lib/growth/actions";

type Kit = Record<string, unknown>;

type Props = {
  productId: string;
  initialKit: Kit;
};

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function MarketingKitEditor({ productId, initialKit }: Props) {
  const t = useTranslations("Growth.admin.productsPage.kitEditor");
  const scripts = (initialKit.scripts as Record<string, string> | undefined) ?? {};

  const [jsonMode, setJsonMode] = useState(false);
  const [headline, setHeadline] = useState(str(initialKit.headline));
  const [pitch, setPitch] = useState(str(initialKit.pitch));
  const [bullets, setBullets] = useState(
    Array.isArray(initialKit.bullets) ? (initialKit.bullets as string[]).join("\n") : "",
  );
  const [scriptDirect, setScriptDirect] = useState(scripts.direct ?? "");
  const [scriptWhatsapp, setScriptWhatsapp] = useState(scripts.whatsapp ?? "");
  const [scriptConsultative, setScriptConsultative] = useState(scripts.consultative ?? "");
  const [jsonText, setJsonText] = useState(JSON.stringify(initialKit, null, 2));

  const kitJson = jsonMode
    ? jsonText
    : JSON.stringify({
        ...initialKit,
        headline,
        pitch,
        bullets: bullets
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        scripts: {
          ...scripts,
          direct: scriptDirect,
          whatsapp: scriptWhatsapp,
          consultative: scriptConsultative,
        },
      });

  return (
    <AdminToastForm action={updateProductMarketingKitAdminAction} className="mt-6 grid gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="marketingKitJson" value={kitJson} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-white/55">
          {jsonMode ? t("jsonMode") : t("visualMode")}
        </span>
        <button
          type="button"
          onClick={() => {
            if (!jsonMode) {
              setJsonText(
                JSON.stringify(
                  {
                    ...initialKit,
                    headline,
                    pitch,
                    bullets: bullets
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean),
                    scripts: {
                      ...scripts,
                      direct: scriptDirect,
                      whatsapp: scriptWhatsapp,
                      consultative: scriptConsultative,
                    },
                  },
                  null,
                  2,
                ),
              );
            }
            setJsonMode((v) => !v);
          }}
          className="text-xs font-semibold text-gold hover:underline"
        >
          {jsonMode ? t("visualMode") : t("jsonMode")}
        </button>
      </div>
      {jsonMode ? (
        <textarea
          rows={14}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 font-mono text-xs text-white outline-none focus:border-gold/40"
        />
      ) : (
        <>
          <label className="block">
            <span className="text-xs text-white/55">{t("headline")}</span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("pitch")}</span>
            <textarea
              rows={3}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("bullets")}</span>
            <textarea
              rows={4}
              value={bullets}
              onChange={(e) => setBullets(e.target.value)}
              placeholder={t("bulletsPh")}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("scriptDirect")}</span>
            <textarea
              rows={2}
              value={scriptDirect}
              onChange={(e) => setScriptDirect(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("scriptWhatsapp")}</span>
            <textarea
              rows={2}
              value={scriptWhatsapp}
              onChange={(e) => setScriptWhatsapp(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/55">{t("scriptConsultative")}</span>
            <textarea
              rows={2}
              value={scriptConsultative}
              onChange={(e) => setScriptConsultative(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
        </>
      )}
      <button
        type="submit"
        className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold hover:border-gold/50"
      >
        {t("save")}
      </button>
    </AdminToastForm>
  );
}
