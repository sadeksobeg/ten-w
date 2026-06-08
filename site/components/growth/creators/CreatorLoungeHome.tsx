"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { CreatorPulsePanel } from "@/components/growth/creators/CreatorPulsePanel";
import { CreatorFeaturedSpotlight, type CreatorFeaturedCreator } from "./CreatorFeaturedSpotlight";
import { CreatorLoungeChat } from "./CreatorLoungeChat";
import { CreatorOnboardingChecklist, type CreatorOnboardingProgress } from "./CreatorOnboardingChecklist";
import { CreatorProfileDrawer } from "./CreatorProfileDrawer";
import { CreatorSalesGuidePanel } from "./CreatorSalesGuidePanel";
import type { CreatorPulseStats } from "@/lib/growth/creator-arena";

export type CreatorSubmissionPreview = {
  id: string;
  userId: string;
  name: string;
  postUrl: string;
  platform: string | null;
  createdAt: string;
  status: string;
};

type ChatViewer = {
  userId: string;
  email: string;
  name: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
};

type SalesProduct = { slug: string; name: string; priceCents: number };

type Props = {
  locale: string;
  isRoomMember: boolean;
  viewer: ChatViewer;
  pulse: CreatorPulseStats;
  featuredCreator: CreatorFeaturedCreator | null;
  recentSubmissions: CreatorSubmissionPreview[];
  onboarding: CreatorOnboardingProgress;
  clientDiscountCode?: string | null;
  commissionPercent?: string;
  salesProducts?: SalesProduct[];
  onNavigate?: (section: "challenge" | "studio" | "home") => void;
  onChallengeCreator?: (creator: CreatorFeaturedCreator) => void;
};

export function CreatorLoungeHome({
  locale,
  isRoomMember,
  viewer,
  pulse,
  featuredCreator,
  recentSubmissions,
  onboarding,
  clientDiscountCode = null,
  commissionPercent = "10%",
  salesProducts = [],
  onNavigate,
  onChallengeCreator,
}: Props) {
  const t = useTranslations("Growth.creators.lounge");
  const [drawerCreator, setDrawerCreator] = useState<CreatorFeaturedCreator | null>(null);

  return (
    <div className="space-y-4">
      <CreatorOnboardingChecklist progress={onboarding} onNavigate={onNavigate} />

      {salesProducts.length > 0 ? (
        <CreatorSalesGuidePanel
          clientDiscountCode={clientDiscountCode}
          commissionPercent={commissionPercent}
          products={salesProducts}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <CreatorPulsePanel pulse={pulse} />
        <CreatorFeaturedSpotlight
          creator={featuredCreator}
          onViewProfile={setDrawerCreator}
          onChallenge={onChallengeCreator}
        />
      </div>

      <CreatorLoungeChat locale={locale} isRoomMember={isRoomMember} viewer={viewer} />

      <GlassCard className="border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-[family-name:var(--font-cairo)] text-base font-extrabold text-white">
          {t("recentSubmissions")}
        </h3>
        {recentSubmissions.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">{t("recentSubmissionsEmpty")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentSubmissions.map((sub) => (
              <li key={sub.id}>
                <a
                  href={sub.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 transition hover:border-gold/35"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{sub.name}</p>
                    <p className="truncate text-[10px] text-white/45">{sub.postUrl}</p>
                  </div>
                  {sub.platform ? (
                    <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-bold uppercase text-white/55">
                      {sub.platform}
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <CreatorProfileDrawer
        creator={drawerCreator}
        onClose={() => setDrawerCreator(null)}
        onChallenge={onChallengeCreator}
      />
    </div>
  );
}
