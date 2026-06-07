import type { CinemaDemoPhase } from "@/stores/cinema-demo-store";

/** Customer booking journey — no admin sidebars or ops chrome */
export const CUSTOMER_BOOKING_PHASES: CinemaDemoPhase[] = [
  "movies",
  "showtime",
  "seats",
  "checkout",
  "upsell",
  "ticket",
];

/** Full Cinema OS manager dashboard */
export const ADMIN_OS_PHASES: CinemaDemoPhase[] = ["sessionReveal"];

/** Focused end screens — center content only */
export const FOCUS_PHASES: CinemaDemoPhase[] = ["roi", "closing"];

export function isCustomerBookingPhase(phase: CinemaDemoPhase): boolean {
  return CUSTOMER_BOOKING_PHASES.includes(phase);
}

export function isAdminOsPhase(phase: CinemaDemoPhase): boolean {
  return ADMIN_OS_PHASES.includes(phase);
}
