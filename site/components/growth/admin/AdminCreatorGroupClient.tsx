"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeIcon } from "@/components/growth/badges/BadgeIcon";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { useToast } from "@/hooks/useToast";
import {
  adminAddCreatorRoomMemberAction,
  adminRemoveCreatorRoomMemberAction,
} from "@/lib/growth/actions";
import { AdminChallengeManager } from "./AdminChallengeManager";
import { AdminCreatorCupManager } from "./AdminCreatorCupManager";
import { AdminCreatorDetailPanel } from "./AdminCreatorDetailPanel";
import { AdminCreatorList } from "./AdminCreatorList";
import { AdminCreatorStatsRow } from "./AdminCreatorStatsRow";
import type {
  CreatorAdminChallenge,
  CreatorAdminChallengeSubmission,
  CreatorAdminPartner,
  CreatorAdminStats,
  CreatorAdminTab,
  CreatorCupRow,
} from "./creator-admin-types";

export type { CreatorAdminPartner } from "./creator-admin-types";

type Props = {
  partners: CreatorAdminPartner[];
  stats: CreatorAdminStats;
  challenges: CreatorAdminChallenge[];
  submissionsByWeek: Record<string, CreatorAdminChallengeSubmission[]>;
  cupLeaderboard: CreatorCupRow[];
};

export function AdminCreatorGroupClient({
  partners: initialPartners,
  stats,
  challenges: initialChallenges,
  submissionsByWeek: initialSubmissionsByWeek,
  cupLeaderboard,
}: Props) {
  const t = useTranslations("Growth.admin.creatorsPage");
  const tAdmin = useTranslations("Growth.creators.admin");
  const { showToast } = useToast();

  const [tab, setTab] = useState<CreatorAdminTab>("creators");
  const [partners, setPartners] = useState(initialPartners);
  const [challenges, setChallenges] = useState(initialChallenges);
  const [submissionsByWeek, setSubmissionsByWeek] = useState(initialSubmissionsByWeek);
  const [selectedPartner, setSelectedPartner] = useState<CreatorAdminPartner | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const tabClass = (active: boolean) =>
    `rounded-lg px-4 py-2 text-xs font-bold transition ${
      active ? "bg-gold/20 text-gold" : "text-white/55 hover:bg-white/[0.04]"
    }`;

  const patchPartner = useCallback(
    (patch: Partial<CreatorAdminPartner> & { userId: string }) => {
      setPartners((prev) =>
        prev.map((p) => (p.userId === patch.userId ? { ...p, ...patch } : p)),
      );
      setSelectedPartner((prev) =>
        prev?.userId === patch.userId ? { ...prev, ...patch } : prev,
      );
    },
    [],
  );

  async function toggleRoom(userId: string, add: boolean) {
    setPendingId(userId);
    const fd = new FormData();
    fd.set("userId", userId);
    const res = add
      ? await adminAddCreatorRoomMemberAction(fd)
      : await adminRemoveCreatorRoomMemberAction(fd);
    setPendingId(null);
    if (res.ok) {
      patchPartner({
        userId,
        inRoom: add,
        hasLoungeAccess: add || (partners.find((p) => p.userId === userId)?.hasBadge ?? false),
      });
      showToast({
        type: "success",
        title: add ? t("toastLoungeGranted") : t("toastRemoved"),
      });
    } else {
      const err = "error" in res ? res.error : "";
      showToast({
        type: "error",
        title: err === "badge_holder_protected" ? t("toastBadgeProtected") : t("toastError"),
      });
    }
  }

  function handleChallengeCreated(challenge: CreatorAdminChallenge) {
    setChallenges((prev) => {
      const exists = prev.some((c) => c.weekKey === challenge.weekKey);
      if (exists) {
        return prev.map((c) => (c.weekKey === challenge.weekKey ? challenge : c));
      }
      return [challenge, ...prev];
    });
    setSubmissionsByWeek((prev) => ({ ...prev, [challenge.weekKey]: prev[challenge.weekKey] ?? [] }));
  }

  function handleSubmissionRated(
    weekKey: string,
    submissionId: string,
    rating: number,
    status: string,
    isFeatured: boolean,
  ) {
    setSubmissionsByWeek((prev) => {
      const rows = prev[weekKey];
      if (!rows) return prev;
      return {
        ...prev,
        [weekKey]: rows.map((s) =>
          s.id === submissionId ? { ...s, adminRating: rating, status, isFeatured } : s,
        ),
      };
    });
    setPartners((prev) =>
      prev.map((p) => ({
        ...p,
        submissions: p.submissions.map((s) =>
          s.id === submissionId ? { ...s, adminRating: rating, status, isFeatured } : s,
        ),
      })),
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="relative overflow-hidden border border-gold/20 bg-gradient-to-br from-gold/10 via-transparent to-rose-500/10 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-20 end-0 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <BadgeIcon badgeKey="content_creator" earned size="md" showGlow />
              <h1 className="font-[family-name:var(--font-cairo)] text-2xl font-extrabold text-white">
                {t("title")}
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/65">{t("subtitle")}</p>
            <p className="mt-2 max-w-xl text-xs text-white/45">{t("accessNote")}</p>
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={tAdmin("tabsAria")}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "creators"}
          className={tabClass(tab === "creators")}
          onClick={() => setTab("creators")}
        >
          {tAdmin("tabCreators")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "challenges"}
          className={tabClass(tab === "challenges")}
          onClick={() => setTab("challenges")}
        >
          {tAdmin("tabChallenges")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "cup"}
          className={tabClass(tab === "cup")}
          onClick={() => setTab("cup")}
        >
          {tAdmin("tabCup")}
        </button>
      </div>

      {tab === "creators" ? (
        <div className="space-y-4">
          <AdminCreatorStatsRow stats={stats} />
          <AdminCreatorList
            partners={partners}
            selectedId={selectedPartner?.userId ?? null}
            onSelect={setSelectedPartner}
            onGrantLounge={(id) => void toggleRoom(id, true)}
            onRevokeLounge={(id) => void toggleRoom(id, false)}
            pendingId={pendingId}
          />
        </div>
      ) : null}

      {tab === "challenges" ? (
        <AdminChallengeManager
          challenges={challenges}
          submissionsByWeek={submissionsByWeek}
          onChallengeCreated={handleChallengeCreated}
          onSubmissionRated={handleSubmissionRated}
        />
      ) : null}

      {tab === "cup" ? <AdminCreatorCupManager leaderboard={cupLeaderboard} /> : null}

      <AdminCreatorDetailPanel
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
        onUpdated={patchPartner}
      />
    </div>
  );
}
