"use client";

import { useTranslations } from "next-intl";
import { resolveVaultIcon } from "@/lib/growth/vault-icons";
import { renderMarkdownLite } from "@/lib/growth/markdown-lite";
import type { VaultProgress } from "@/lib/growth/vault-unlock";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { IconCheck, IconLock } from "@/components/growth/icons/GrowthIcons";

export type VaultItemView = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  preview: string | null;
  content: string;
  icon: string | null;
  unlocked: boolean;
  progress: VaultProgress;
  criteriaLabel: string;
};

type Props = { item: VaultItemView; locale: string };

export function VaultItemCard({ item }: Props) {
  const t = useTranslations("Growth.vault");
  const VaultIcon = resolveVaultIcon(item.icon);
  const StatusIcon = item.unlocked ? IconCheck : IconLock;

  return (
    <GlassCard
      className={`p-5 ${item.unlocked ? "border-gold/35" : "border-white/10 opacity-95"}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl border ${
            item.unlocked
              ? "border-gold/35 bg-gold/10 text-gold"
              : "border-white/15 bg-white/[0.04] text-white/45"
          }`}
          aria-hidden
        >
          <VaultIcon size={22} />
          <span
            className={`absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full border ${
              item.unlocked ? "border-gold/40 bg-[#0a0c14] text-gold" : "border-white/20 bg-[#0a0c14] text-white/50"
            }`}
          >
            <StatusIcon size={11} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white">{item.title}</h3>
          <p className="mt-1 text-sm text-white/60">{item.desc}</p>
          {!item.unlocked && item.preview ? (
            <p className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/40 blur-[2px] select-none">
              {item.preview}
            </p>
          ) : null}
          {!item.unlocked ? (
            <div className="mt-4">
              <p className="text-xs text-gold">{t("locked", { criteria: item.criteriaLabel })}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold/60"
                  style={{
                    width: `${Math.min(100, Math.round((item.progress.current / Math.max(1, item.progress.target)) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-white/50">
                {item.progress.current} / {item.progress.target}
              </p>
            </div>
          ) : (
            <div
              className="prose-growth mt-4 text-sm text-white/85"
              dangerouslySetInnerHTML={{ __html: renderMarkdownLite(item.content) }}
            />
          )}
        </div>
      </div>
    </GlassCard>
  );
}
