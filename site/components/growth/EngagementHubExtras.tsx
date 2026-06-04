"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/growth/get-dashboard";
import { OathModal } from "@/components/growth/OathModal";
import { TimeCapsuleModal } from "@/components/growth/capsule/TimeCapsuleModal";
import { TimeCapsuleCountdown } from "@/components/growth/capsule/TimeCapsuleCountdown";
import { WeeklyNewspaper } from "@/components/growth/chronicle/WeeklyNewspaper";

type Props = {
  locale: string;
  data: DashboardData;
  userName: string;
};

export function EngagementHubExtras({ locale, data, userName }: Props) {
  const [oathOpen, setOathOpen] = useState(data.engagement.showOathModal);
  const [capsuleOpen, setCapsuleOpen] = useState(data.engagement.showCapsulePrompt);
  const openDate = new Date();
  openDate.setUTCDate(openDate.getUTCDate() + 180);
  const openLabel = openDate.toLocaleDateString(
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <>
      <OathModal
        open={oathOpen}
        defaultName={userName}
        onComplete={() => setOathOpen(false)}
      />
      <TimeCapsuleModal
        open={capsuleOpen}
        onClose={() => setCapsuleOpen(false)}
        openDateLabel={openLabel}
      />
      {data.engagement.timeCapsuleDaysLeft != null ? (
        <TimeCapsuleCountdown daysLeft={data.engagement.timeCapsuleDaysLeft} />
      ) : null}
      {data.engagement.weeklyChronicle ? (
        <WeeklyNewspaper locale={locale} chronicle={data.engagement.weeklyChronicle} />
      ) : null}
    </>
  );
}
