"use client";

import { useTranslations } from "next-intl";
import { CreatorWorkflowStatus } from "@prisma/client";
import { GrowthAvatar } from "@/components/growth/GrowthAvatar";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconStarFilled } from "@/components/growth/icons/GrowthIcons";

export type CreatorFeaturedCreator = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  publicSlug: string | null;
  featuredCount: number;
  status: CreatorWorkflowStatus;
};

type Props = {
  creator: CreatorFeaturedCreator | null;
  onViewProfile?: (creator: CreatorFeaturedCreator) => void;
  onChallenge?: (creator: CreatorFeaturedCreator) => void;
};

export function CreatorFeaturedSpotlight({ creator, onViewProfile, onChallenge }: Props) {
  const t = useTranslations("Growth.creators.spotlight");

  if (!creator) return null;

  return (
    <GlassCard
      variant="highlight"
      className="border border-gold/30 bg-gradient-to-br from-gold/15 via-transparent to-rose-500/10 p-5"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <GrowthAvatar
            name={creator.name}
            email={creator.userId}
            avatarUrl={creator.avatarUrl}
            size="lg"
          />
          <span className="absolute -bottom-1 -end-1 flex size-7 items-center justify-center rounded-full border border-gold/50 bg-gold/20 text-gold">
            <IconStarFilled size={14} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/80">
            {t("eyebrow")}
          </p>
          <h3 className="mt-1 truncate font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
            {creator.name}
          </h3>
          <p className="mt-1 text-xs text-white/55">
            {t("featuredCount", { count: creator.featuredCount })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {onViewProfile ? (
              <GoldButton
                type="button"
                variant="ghost"
                className="text-xs"
                onClick={() => onViewProfile(creator)}
              >
                {t("viewProfile")}
              </GoldButton>
            ) : null}
            {onChallenge ? (
              <GoldButton type="button" className="text-xs" onClick={() => onChallenge(creator)}>
                {t("challenge")}
              </GoldButton>
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
