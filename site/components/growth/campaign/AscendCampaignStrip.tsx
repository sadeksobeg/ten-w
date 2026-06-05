"use client";

import type { AscendCampaign } from "@/lib/growth/ascend-campaigns";
import { AscendRevealBanner } from "@/components/growth/campaign/AscendRevealBanner";

type Props = {
  campaigns: AscendCampaign[];
  locale: string;
};

export function AscendCampaignStrip({ campaigns, locale }: Props) {
  if (campaigns.length === 0) return null;
  return (
    <div className="space-y-4">
      {campaigns.map((c) => (
        <AscendRevealBanner key={c.id} campaign={c} locale={locale} />
      ))}
    </div>
  );
}
