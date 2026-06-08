"use client";

import { CreatorLoungeLayout, type CreatorLoungeProps } from "./CreatorLoungeLayout";

export type {
  CreatorLoungeSection,
  CreatorEventPreview,
  CreatorChatViewer,
  CreatorBattleCandidate,
  CreatorViewerProfile,
  CreatorLoungeProps,
} from "./CreatorLoungeLayout";

export type { CreatorSubmissionPreview } from "./CreatorLoungeHome";
export type { CreatorFeaturedCreator } from "./CreatorFeaturedSpotlight";
export type { CreatorOnboardingProgress } from "./CreatorOnboardingChecklist";
export type { CreatorBattleHistoryItem } from "./CreatorLoungeBattles";

type Props = CreatorLoungeProps;

export function ContentCreatorHub(props: Props) {
  return <CreatorLoungeLayout {...props} />;
}
