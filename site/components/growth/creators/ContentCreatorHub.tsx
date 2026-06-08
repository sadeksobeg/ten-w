"use client";

import { CreatorHubLayout } from "./CreatorHubLayout";
import type { CreatorHubProps } from "./CreatorHubTypes";

export type { CreatorHubSection, CreatorHubProps } from "./CreatorHubTypes";

type Props = CreatorHubProps;

export function ContentCreatorHub(props: Props) {
  return <CreatorHubLayout {...props} />;
}
