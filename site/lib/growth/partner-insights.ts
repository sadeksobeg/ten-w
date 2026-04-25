export type PartnerInsightSlide = {
  key: string;
  params?: Record<string, number | string>;
};

export function buildPartnerInsightSlides(input: {
  pendingDeals: number;
  closedDeals: number;
  streakCurrent: number;
  weeklyRank: number;
  weeklyFieldSize: number;
  weeklyClosed: number;
}): PartnerInsightSlide[] {
  const slides: PartnerInsightSlide[] = [];

  if (input.pendingDeals >= 3) {
    slides.push({ key: "followUpLoad", params: { n: input.pendingDeals } });
  }

  if (input.streakCurrent >= 4) {
    slides.push({ key: "streakProtect", params: { n: input.streakCurrent } });
  }

  if (input.weeklyClosed > 0 && input.weeklyRank > 5 && input.weeklyFieldSize >= 6) {
    slides.push({
      key: "rankClimb",
      params: { rank: input.weeklyRank, total: input.weeklyFieldSize },
    });
  }

  if (input.closedDeals > 0 && input.pendingDeals === 0) {
    slides.push({ key: "pipelineClean" });
  }

  if (slides.length === 0) {
    slides.push({ key: "defaultMomentum" });
  }

  return slides.slice(0, 3);
}
