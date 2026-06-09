"use client";

import type { ReactNode } from "react";
import type { CreatorHubProps, CreatorHubSection } from "./CreatorHubTypes";
import {
  CreatorAnalyticsSectionLazy,
  CreatorBattlesSectionLazy,
  CreatorChallengeSectionLazy,
  CreatorChatSectionLazy,
  CreatorDashboardSection,
  CreatorKitSectionLazy,
  CreatorLeaderboardSectionLazy,
  CreatorNetworkSectionLazy,
  CreatorPlanningSectionLazy,
  CreatorProfileSectionLazy,
} from "./creator-hub-sections";
import { ensureCreatorDirectRoomAction } from "@/lib/growth/creator-arena-actions";

type Props = {
  section: CreatorHubSection;
  visited: Set<CreatorHubSection>;
  props: CreatorHubProps;
  viewerName: string;
  consentGiven: boolean;
  onNavigate: (section: CreatorHubSection) => void;
  onChallengeCreator: (creator: CreatorHubProps["featuredCreator"]) => void;
  onUnread: (n: number) => void;
};

function renderSection(
  id: CreatorHubSection,
  hub: Props,
): ReactNode {
  const { props, viewerName, consentGiven, onNavigate, onChallengeCreator, onUnread } = hub;

  switch (id) {
    case "dashboard":
      return (
        <CreatorDashboardSection
          locale={props.locale}
          viewer={props.viewer}
          metrics={props.metrics}
          challenge={props.challenge}
          featuredCreator={props.featuredCreator}
          recentSubmissions={props.recentSubmissions}
          onboarding={props.onboarding}
          viewerRank={props.viewerRank}
          clientDiscountCode={props.clientDiscountCode}
          onNavigate={onNavigate}
          onChallengeCreator={onChallengeCreator}
          activeBattles={props.activeBattles}
          weekStreak={props.weekStreak}
          challengeSubmitCount={props.challengeSubmitCount}
          challengeParticipantCount={props.challengeParticipantCount}
        />
      );
    case "chat":
      return (
        <CreatorChatSectionLazy
          locale={props.locale}
          isRoomMember={props.isRoomMember}
          viewer={props.viewer}
          rooms={props.chatRooms}
          isActive={hub.section === "chat"}
          onUnread={onUnread}
        />
      );
    case "planning":
      return <CreatorPlanningSectionLazy userId={props.viewer.userId} contentIdeas={props.contentIdeas} />;
    case "challenge":
      return (
        <CreatorChallengeSectionLazy
          challenge={props.challenge}
          weekSubmissions={props.weekSubmissions}
          myUserId={props.viewer.userId}
        />
      );
    case "leaderboard":
      return <CreatorLeaderboardSectionLazy rows={props.cupRows} myUserId={props.viewer.userId} />;
    case "battles":
      return (
        <CreatorBattlesSectionLazy
          myUserId={props.viewer.userId}
          candidates={props.battleCandidates}
          history={props.battleHistory}
          activeBattle={props.activeBattle}
          pendingInvites={props.pendingInvites}
        />
      );
    case "kit":
      return (
        <CreatorKitSectionLazy
          clientDiscountCode={props.clientDiscountCode}
          commissionPercent={props.commissionPercent}
          salesProducts={props.salesProducts}
          viewerName={viewerName}
          utmWeeklySeries={props.utmWeeklySeries}
          referralProof={props.referralProof}
          utmClicks={props.metrics.utmClicks}
          utmRegistrations={props.metrics.utmRegistrations}
        />
      );
    case "analytics":
      return (
        <CreatorAnalyticsSectionLazy
          series={props.analyticsSeries}
          totalSubmissions={props.metrics.weekSubmissions}
          totalReferrals={props.metrics.utmRegistrations}
          cupPoints={props.metrics.cupScore}
          approvalRate={props.approvalRate}
          benchmarks={props.analyticsBenchmarks}
        />
      );
    case "network":
      return (
        <CreatorNetworkSectionLazy
          directory={props.directory}
          myUserId={props.viewer.userId}
          onNavigate={onNavigate}
          onMessage={(peerId) => {
            void ensureCreatorDirectRoomAction(peerId).then(() => onNavigate("chat"));
          }}
        />
      );
    case "profile":
      return (
        <CreatorProfileSectionLazy
          locale={props.locale}
          badges={props.badges}
          milestones={props.milestones}
          statusCards={props.statusCards}
          myUserId={props.viewer.userId}
          bio={props.bio}
          specialty={props.specialty}
          status={props.viewer.status}
          viewerName={viewerName}
          viewerEmail={props.viewer.email}
          avatarUrl={props.viewer.avatarUrl}
          avatarPreset={props.viewer.avatarPreset}
          levelCode={props.viewer.levelCode}
          hasBadge={props.hasBadge}
          consentGiven={consentGiven}
          viewerRank={props.viewerRank}
          platformReviewPending={props.platformReviewPending}
        />
      );
    default:
      return null;
  }
}

export function CreatorHubSectionHost({
  section,
  visited,
  props,
  viewerName,
  consentGiven,
  onNavigate,
  onChallengeCreator,
  onUnread,
}: Props) {
  const hostProps: Props = {
    section,
    visited,
    props,
    viewerName,
    consentGiven,
    onNavigate,
    onChallengeCreator,
    onUnread,
  };

  return (
    <>
      {Array.from(visited).map((id) => {
        const active = section === id;
        return (
          <div
            key={id}
            className={active ? "creator-hub-section-panel creator-hub-section-panel--active" : "creator-hub-section-panel"}
            hidden={!active}
            aria-hidden={!active}
          >
            {renderSection(id, hostProps)}
          </div>
        );
      })}
    </>
  );
}
