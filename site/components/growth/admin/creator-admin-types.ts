import type { CreatorWorkflowStatus } from "@prisma/client";
import type { CreatorCupRow } from "@/lib/growth/creator-arena";

export type CreatorAdminSubmission = {
  id: string;
  weekKey: string;
  postUrl: string;
  platform: string | null;
  adminRating: number | null;
  status: string;
  isFeatured: boolean;
  createdAt: string;
};

export type CreatorAdminPartner = {
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  hasBadge: boolean;
  inRoom: boolean;
  hasLoungeAccess: boolean;
  badgeGrantedAt: string | null;
  workflowStatus: CreatorWorkflowStatus | null;
  totalSubmissions: number;
  featuredCount: number;
  cupScore: number;
  notes: string | null;
  milestones: string[];
  submissions: CreatorAdminSubmission[];
  nominationCount: number;
};

export type CreatorAdminStats = {
  totalCreators: number;
  activeThisWeek: number;
  featured: number;
  pendingSubmissions: number;
};

export type CreatorAdminChallenge = {
  id: string;
  weekKey: string;
  titleAr: string;
  titleEn: string;
  titleFr: string;
  bodyAr: string;
  bodyEn: string;
  bodyFr: string;
  xpReward: number;
  active: boolean;
  totalSubmissions: number;
  startsAt: string;
  endsAt: string;
};

export type CreatorAdminChallengeSubmission = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  weekKey: string;
  postUrl: string;
  platform: string | null;
  adminRating: number | null;
  status: string;
  isFeatured: boolean;
  createdAt: string;
};

export type CreatorAdminTab = "creators" | "submissions" | "challenges" | "cup" | "applications";

export type CreatorAdminMissingSubmission = {
  userId: string;
  name: string;
  email: string;
};

export type { CreatorCupRow };
