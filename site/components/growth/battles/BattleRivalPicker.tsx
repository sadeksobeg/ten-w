"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  BattleCandidate,
  BattleCandidateGroup,
  BattleCandidateReason,
} from "@/lib/growth/battle-candidates";

type Props = {
  groups: BattleCandidateGroup[];
  locale: string;
};

const GROUP_LABEL: Record<BattleCandidateReason, string> = {
  rival: "groupRival",
  territory: "groupTerritory",
  network: "groupNetwork",
  leaderboard: "groupLeaderboard",
};

export function BattleRivalPicker({ groups, locale }: Props) {
  const t = useTranslations("Growth.battles");
  const tMap = useTranslations("Growth.map.territories");
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<BattleCandidateReason>(
    groups[0]?.reason ?? "rival",
  );

  const flat = useMemo(
    () => groups.flatMap((g) => g.candidates),
    [groups],
  );

  const activeGroup = groups.find((g) => g.reason === activeTab) ?? groups[0];

  if (flat.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm leading-relaxed text-white/55">
        {t("noCandidates")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="challengedId" value={selectedId} required />

      <p className="text-xs leading-relaxed text-white/50">{t("pickRivalHint")}</p>

      {groups.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.reason}
              type="button"
              onClick={() => setActiveTab(g.reason)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                activeTab === g.reason
                  ? "bg-gold text-bg"
                  : "border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
              }`}
            >
              {t(GROUP_LABEL[g.reason] as "groupRival")}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {(activeGroup?.candidates ?? flat).map((c) => (
          <CandidateCard
            key={c.userId}
            candidate={c}
            selected={selectedId === c.userId}
            onSelect={() => setSelectedId(c.userId)}
            territoryLabel={
              c.territoryKey ? tMap(c.territoryKey) : t("territoryUnknown")
            }
            reasonLabel={t(GROUP_LABEL[c.reason] as "groupRival")}
            locale={locale}
            t={t}
          />
        ))}
      </div>

      {selectedId ? (
        <p className="text-xs font-semibold text-gold/90">{t("selectedPartner")}</p>
      ) : (
        <p className="text-xs text-white/40">{t("selectPartner")}</p>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  onSelect,
  territoryLabel,
  reasonLabel,
  locale,
  t,
}: {
  candidate: BattleCandidate;
  selected: boolean;
  onSelect: () => void;
  territoryLabel: string;
  reasonLabel: string;
  locale: string;
  t: ReturnType<typeof useTranslations<"Growth.battles">>;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition ${
        selected
          ? "border-gold/50 bg-gold/[0.08] shadow-[0_0_24px_-8px_rgba(228,184,77,0.45)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
          selected ? "bg-gold text-bg" : "bg-white/10 text-white/80"
        }`}
        aria-hidden
      >
        {candidate.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-white">{candidate.name}</span>
        <span className="mt-0.5 block text-[11px] text-white/50">
          {candidate.levelCode.toUpperCase()}
          {candidate.territoryKey ? ` · ${territoryLabel}` : ""}
        </span>
        <span className="mt-1 inline-block rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-semibold text-white/45">
          {reasonLabel}
          {candidate.rank ? ` · #${candidate.rank}` : ""}
          {candidate.closedDealsThisWeek != null && candidate.reason === "leaderboard"
            ? ` · ${candidate.closedDealsThisWeek} ${locale === "ar" ? "صفقة" : "deals"}`
            : ""}
        </span>
      </span>
      <span
        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
          selected ? "border-gold bg-gold" : "border-white/25"
        }`}
        aria-hidden
      />
    </button>
  );
}
