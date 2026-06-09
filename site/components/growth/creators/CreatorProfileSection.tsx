"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { CreatorHubProfileCard } from "./CreatorHubProfileCard";
import { CreatorLoungeAchievements } from "./CreatorLoungeAchievements";
import { CreatorStatusBoard } from "./CreatorStatusBoard";
import { CreatorPlatformReviewTask } from "./CreatorPlatformReviewTask";
import { saveCreatorProfileAction } from "@/lib/growth/creator-arena-actions";
import type { BadgeGridItem } from "@/components/growth/badges/BadgeGrid";
import type { CreatorStatusCard } from "@/lib/growth/creator-arena";
import { CreatorWorkflowStatus } from "@prisma/client";

const STATUSES = ["INVITED", "JOINED", "FILMING", "SUBMITTED", "FEATURED"] as const;
const SPECIALTY_OPTIONS = ["tech", "business", "education", "entertainment", "lifestyle"] as const;

type Props = {
  locale: string;
  badges: BadgeGridItem[];
  milestones: string[];
  statusCards: CreatorStatusCard[];
  myUserId: string;
  bio: string | null;
  specialty: string[];
  status: CreatorWorkflowStatus;
  viewerName: string;
  viewerEmail: string;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
  levelCode: string;
  hasBadge: boolean;
  consentGiven: boolean;
  viewerRank?: number | null;
  platformReviewPending: boolean;
};

export function CreatorProfileSection({
  locale,
  badges,
  milestones,
  statusCards,
  myUserId,
  bio: initialBio,
  specialty: initialSpecialty,
  status,
  viewerName,
  viewerEmail,
  avatarUrl,
  avatarPreset,
  levelCode,
  hasBadge,
  consentGiven,
  viewerRank,
  platformReviewPending,
}: Props) {
  const t = useTranslations("Creators.profile");
  const tStatus = useTranslations("Creators.status");
  const [state, formAction, pending] = useActionState(saveCreatorProfileAction, undefined);

  return (
    <div className="space-y-4">
      <CreatorHubProfileCard
        name={viewerName}
        email={viewerEmail}
        avatarUrl={avatarUrl ?? null}
        avatarPreset={avatarPreset}
        levelCode={levelCode}
        locale={locale}
        status={status}
        hasBadge={hasBadge}
        consentGiven={consentGiven}
        viewerRank={viewerRank}
      />
      <CreatorPlatformReviewTask pending={platformReviewPending} />
      <GlassCard className="creator-card p-5">
        <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">{t("title")}</h2>
        <form action={formAction} className="mt-4 space-y-3">
          <label className="block text-xs text-white/60">
            {t("bio")}
            <textarea name="bio" defaultValue={initialBio ?? ""} maxLength={280} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" />
          </label>
          <fieldset>
            <legend className="text-xs text-white/60">{t("specialtyLabel")}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-1 text-[10px] text-white/75">
                  <input type="checkbox" name="specialty" value={s} defaultChecked={initialSpecialty.includes(s)} />
                  {t(`specialty.${s}`)}
                </label>
              ))}
            </div>
          </fieldset>
          {state && !state.ok ? <p className="text-xs text-rose-300">{t("error")}</p> : null}
          <GoldButton type="submit" disabled={pending}>{t("save")}</GoldButton>
        </form>
      </GlassCard>

      <GlassCard className="creator-card p-5">
        <h3 className="text-sm font-extrabold text-white">{t("journey")}</h3>
        <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto text-[9px] font-bold uppercase">
          {STATUSES.map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <span className={`flex size-6 items-center justify-center rounded-full ${status === s ? "creator-active-border text-white" : "border border-white/20 text-white/40"}`}>{i + 1}</span>
              <span className="mt-1 text-white/55">{tStatus(s.toLowerCase())}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <CreatorLoungeAchievements locale={locale} badges={badges} milestones={milestones} />
      <CreatorStatusBoard cards={statusCards} myUserId={myUserId} />
    </div>
  );
}
