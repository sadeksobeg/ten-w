/** Single source for growth game tuning (XP, colors, milestones). */
export const GAME_CONFIG = {
  dailyCheckInXp: 25,
  checkInMilestones: [
    { days: 7, bonusXp: 50 },
    { days: 30, bonusXp: 200 },
    { days: 100, bonusXp: 500 },
  ] as const,
  dealCloseXpEstimate: 150,
  levelColors: {
    starter: "#94a3b8",
    bronze: "#cd7f32",
    silver: "#c0c0c0",
    gold: "#d4af37",
    platinum: "#e5e4e2",
    diamond: "#b9f2ff",
    legend: "#a855f7",
  } as Record<string, string>,
  appreciationDailyLimit: 3,
} as const;
