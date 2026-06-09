import { CreatorLoungeSkeleton } from "@/components/growth/creators/CreatorLoungeSkeleton";

export default function GrowthCreatorsLoading() {
  return (
    <div className="growth-creator-hub-page growth-page-enter p-4 sm:p-6">
      <CreatorLoungeSkeleton />
    </div>
  );
}
