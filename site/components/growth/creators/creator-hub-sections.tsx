"use client";

import dynamic from "next/dynamic";
import { CreatorLoungeSectionSkeleton } from "./CreatorLoungeSkeleton";

const skeleton = () => <CreatorLoungeSectionSkeleton />;

export const CreatorDashboardSection = dynamic(
  () => import("./CreatorDashboard").then((m) => m.CreatorDashboard),
  { loading: skeleton },
);
export const CreatorChatSectionLazy = dynamic(
  () => import("./CreatorChatSection").then((m) => m.CreatorChatSection),
  { loading: skeleton },
);
export const CreatorPlanningSectionLazy = dynamic(
  () => import("./CreatorPlanningSection").then((m) => m.CreatorPlanningSection),
  { loading: skeleton },
);
export const CreatorChallengeSectionLazy = dynamic(
  () => import("./CreatorChallengeSection").then((m) => m.CreatorChallengeSection),
  { loading: skeleton },
);
export const CreatorLeaderboardSectionLazy = dynamic(
  () => import("./CreatorLeaderboardSection").then((m) => m.CreatorLeaderboardSection),
  { loading: skeleton },
);
export const CreatorBattlesSectionLazy = dynamic(
  () => import("./CreatorBattlesSection").then((m) => m.CreatorBattlesSection),
  { loading: skeleton },
);
export const CreatorKitSectionLazy = dynamic(
  () => import("./CreatorKitSection").then((m) => m.CreatorKitSection),
  { loading: skeleton },
);
export const CreatorAnalyticsSectionLazy = dynamic(
  () => import("./CreatorAnalyticsSection").then((m) => m.CreatorAnalyticsSection),
  { loading: skeleton },
);
export const CreatorNetworkSectionLazy = dynamic(
  () => import("./CreatorNetworkSection").then((m) => m.CreatorNetworkSection),
  { loading: skeleton },
);
export const CreatorProfileSectionLazy = dynamic(
  () => import("./CreatorProfileSection").then((m) => m.CreatorProfileSection),
  { loading: skeleton },
);
