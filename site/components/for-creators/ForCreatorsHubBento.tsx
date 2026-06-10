"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { HubPreviewDashboard } from "./hub-preview/HubPreviewDashboard";
import { HubPreviewChallenge } from "./hub-preview/HubPreviewChallenge";
import { HubPreviewKit } from "./hub-preview/HubPreviewKit";

const BENTO = [
  { key: "hub", span: "lg:col-span-2 lg:row-span-2", preview: "dashboard" as const },
  { key: "chat", span: "", preview: "chat" as const },
  { key: "challenge", span: "", preview: "challenge" as const },
  { key: "cup", span: "", preview: "cup" as const },
  { key: "kit", span: "", preview: "kit" as const },
  { key: "earn", span: "lg:col-span-2", preview: "earn" as const },
] as const;

function MiniPreview({ type }: { type: (typeof BENTO)[number]["preview"] }) {
  if (type === "dashboard") {
    return (
      <div className="h-28 overflow-hidden rounded-lg border border-white/10 bg-black/40">
        <HubPreviewDashboard />
      </div>
    );
  }
  if (type === "challenge" || type === "cup") {
    return (
      <div className="h-28 overflow-hidden rounded-lg border border-white/10 bg-black/40">
        <HubPreviewChallenge />
      </div>
    );
  }
  if (type === "kit" || type === "earn") {
    return (
      <div className="h-28 overflow-hidden rounded-lg border border-white/10 bg-black/40">
        <HubPreviewKit />
      </div>
    );
  }
  return (
    <div className="flex h-28 flex-col justify-center gap-1.5 rounded-lg border border-white/10 bg-black/40 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-2">
          <span className="size-5 shrink-0 rounded-full bg-violet-500/30" />
          <span className="h-2 flex-1 rounded bg-white/10" style={{ width: `${70 - i * 12}%` }} />
        </div>
      ))}
    </div>
  );
}

export function ForCreatorsHubBento() {
  const t = useTranslations("Creators.public.bento");

  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--creator-secondary)]/70">{t("eyebrow")}</p>
        <h2 className="mt-3 font-[family-name:var(--font-cairo)] text-2xl font-extrabold sm:text-3xl">{t("title")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/55">{t("subtitle")}</p>
      </motion.div>

      <div className="mt-10 grid auto-rows-[minmax(140px,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BENTO.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.06 }}
            className={`fc-bento-card creator-card group flex flex-col p-4 ${item.span}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-[family-name:var(--font-cairo)] font-bold text-[var(--creator-secondary)]">
                  {t(`items.${item.key}.title`)}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{t(`items.${item.key}.body`)}</p>
              </div>
            </div>
            <div className="mt-3 flex-1">
              <MiniPreview type={item.preview} />
            </div>
            <Link
              href={item.key === "hub" ? "/growth/creators" : `/growth/creators?section=${item.key === "earn" ? "kit" : item.key}`}
              className="mt-3 text-[10px] font-bold text-white/40 transition group-hover:text-[var(--creator-secondary)]"
            >
              {t("open")} →
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
