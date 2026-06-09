import type { CreatorWorkflowStatus } from "@prisma/client";
import type { BadgeGridItem } from "@/components/growth/badges/BadgeGrid";
import type {
  CreatorChallengeView,
  CreatorCupRow,
  CreatorDashboardMetrics,
  CreatorDirectoryEntry,
  CreatorPulseStats,
  CreatorStatusCard,
  CreatorAnalyticsPoint,
  CreatorWeekStreakData,
  CreatorReferralRow,
} from "@/lib/growth/creator-arena";
import type { CreatorChatRoomPreview } from "@/lib/growth/creator-chat";
import type { CreatorFeaturedCreator } from "./CreatorFeaturedSpotlight";
import type { CreatorOnboardingProgress } from "./CreatorOnboardingChecklist";

export type CreatorSubmissionPreview = {
  id: string;
  userId: string;
  name: string;
  postUrl: string;
  platform: string | null;
  createdAt: string;
  status: string;
};

export type CreatorBattleHistoryItem = {
  id: string;
  opponentName: string;
  outcome: "won" | "lost" | "pending";
  endedAt: string | null;
};

export type CreatorHubSection =
  | "dashboard"
  | "chat"
  | "planning"
  | "challenge"
  | "leaderboard"
  | "battles"
  | "kit"
  | "analytics"
  | "network"
  | "profile";

export type CreatorHubViewer = {
  userId: string;
  email: string;
  name: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
  levelCode: string;
  status: CreatorWorkflowStatus;
};

export type CreatorHubProps = {
  locale: string;
  hasBadge: boolean;
  isRoomMember: boolean;
  viewer: CreatorHubViewer;
  publicSlug: string | null;
  pulse: CreatorPulseStats;
  metrics: CreatorDashboardMetrics;
  statusCards: CreatorStatusCard[];
  cupRows: CreatorCupRow[];
  challenge: CreatorChallengeView | null;
  battleCandidates: Array<{ userId: string; name: string; levelCode: string; initials: string }>;
  featuredCreator: CreatorFeaturedCreator | null;
  recentSubmissions: CreatorSubmissionPreview[];
  onboarding: CreatorOnboardingProgress;
  battleHistory: CreatorBattleHistoryItem[];
  activeBattles: number;
  badges: BadgeGridItem[];
  milestones: string[];
  clientDiscountCode: string | null;
  commissionPercent: string;
  salesProducts: Array<{ slug: string; name: string; priceCents: number }>;
  chatRooms: CreatorChatRoomPreview[];
  directory: CreatorDirectoryEntry[];
  analyticsSeries: CreatorAnalyticsPoint[];
  utmStats: Array<{ platform: string; clicks: number; registrations: number; conversionPct: number }>;
  contentIdeas: Array<
    | { id: string; title: string; column: string; platform: string; priority: string }
    | { type: "series"; id: string; name: string; target: number; completed: number; episodes: string[] }
  >;
  viewerRank: number | null;
  bio: string | null;
  specialty: string[];
  weekSubmissions: Array<{
    id: string;
    userId: string;
    name: string;
    postUrl: string;
    platform: string | null;
    adminRating: number | null;
    status: string;
    createdAt: string;
  }>;
  activeBattle: {
    id: string;
    challengerId: string;
    challengedId: string;
    status: string;
    challengerProgress: number;
    challengedProgress: number;
    target: number;
    stakesXp: number;
    endsAt: string | null;
    challengerName: string;
    challengedName: string;
  } | null;
  pendingInvites: Array<{ id: string; challengerName: string; stakesXp: number; target: number }>;
  approvalRate: number;
  weekStreak: CreatorWeekStreakData;
  challengeSubmitCount: number;
  challengeParticipantCount: number;
  utmWeeklySeries: Array<{ label: string; clicks: number }>;
  referralProof: { rows: CreatorReferralRow[]; totalCents: number };
  analyticsBenchmarks: { avgSubmissions: number; avgClicks: number };
  needsConsent: boolean;
  consentVersionMismatch: boolean;
  consentGiven: boolean;
};

export type { CreatorFeaturedCreator, CreatorOnboardingProgress };
