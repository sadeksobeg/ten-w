"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import type { CreatorCupRow } from "@/lib/growth/creator-arena";
import { CreatorNameWithConsentBadge } from "./CreatorConsentVerifiedBadge";

type Props = {
  rows: CreatorCupRow[];
  myUserId: string;
};

export function CreatorCupPanel({ rows, myUserId }: Props) {
  const t = useTranslations("Growth.creators");
  const tConsent = useTranslations("Creators.consent");

  return (
    <GlassCard className="border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-gold">
            {t("cupTitle")}
          </h2>
          <p className="mt-1 text-xs text-white/55">{t("cupSubtitle")}</p>
        </div>
        <Link href="/growth/battles" className="text-[11px] font-semibold text-gold/90 hover:underline">
          {t("cupBattles")}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">{t("cupEmpty")}</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {rows.map((row) => {
            const isMe = row.userId === myUserId;
            return (
              <li
                key={row.userId}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  isMe ? "border-gold/40 bg-gold/10" : "border-white/10 bg-black/20"
                }`}
              >
                <span className="w-6 text-center text-sm font-black text-gold">#{row.rank}</span>
                <GrowthAvatar name={row.name ?? "?"} email={row.userId} size="sm" />
                <div className="min-w-0 flex-1">
                  <CreatorNameWithConsentBadge
                    name={`${row.name ?? t("cupAnonymous")}${isMe ? ` (${t("cupYou")})` : ""}`}
                    verified={row.consentGiven}
                    label={tConsent("verifiedBadge")}
                    nameClassName="truncate text-sm font-semibold text-white"
                  />
                  <p className="text-[10px] text-white/45">
                    {t("cupMeta", { posts: row.submissions })}
                  </p>
                </div>
                <span className="text-sm font-bold text-gold">{row.score}</span>
              </li>
            );
          })}
        </ol>
      )}
    </GlassCard>
  );
}
