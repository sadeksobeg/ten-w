export const ROI_CONSTANTS = {
  avgTicketSyp: 15000,
  occupancyBoost: 0.12,
  showsPerMonth: 20,
  hoursSavedPerDay: 3,
  daysPerMonth: 30,
  estimatedSystemCostSyp: 4500000,
} as const;

export type RoiResult = {
  extraRevenueMonthly: number;
  timeSavedHours: number;
  roiRatio: number;
};

export function calcRoi(seats: number): RoiResult {
  const { avgTicketSyp, occupancyBoost, showsPerMonth, hoursSavedPerDay, daysPerMonth, estimatedSystemCostSyp } =
    ROI_CONSTANTS;
  const extraRevenueMonthly = Math.round(seats * occupancyBoost * avgTicketSyp * showsPerMonth);
  const timeSavedHours = hoursSavedPerDay * daysPerMonth;
  const roiRatio = extraRevenueMonthly / estimatedSystemCostSyp;
  return { extraRevenueMonthly, timeSavedHours, roiRatio };
}
