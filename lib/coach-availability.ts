import type { Coach } from "@/lib/coaches-data";

// The slot shape and validation are shared with the players' availability check.
export {
  isSlotValid,
  type AvailabilitySlot,
} from "@/lib/availability";

import type { AvailabilitySlot } from "@/lib/availability";

/** Result of checking a single coach against a slot. */
export interface CoachAvailability {
  coachId: string;
  name: string;
  available: boolean;
  /** Reason shown when the coach is busy. */
  reason: string | null;
}

const BUSY_REASONS = [
  "אימון קבוצתי",
  "טורניר חיצוני",
  "שיעור פרטי",
  "התחייבות אישית",
];

/** Deterministic pseudo-hash so the same inputs always give the same answer. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Mock availability check. No real backend exists yet, so we derive a stable
 * answer from the coach id and the requested slot. Roughly 60% are free.
 */
export function checkCoachAvailability(
  coaches: Coach[],
  slot: AvailabilitySlot,
): CoachAvailability[] {
  return coaches.map((coach) => {
    const h = hash(`${coach.id}|${slot.date}|${slot.startTime}|${slot.endTime}`);
    const available = h % 10 < 6;
    return {
      coachId: coach.id,
      name: coach.name,
      available,
      reason: available ? null : BUSY_REASONS[h % BUSY_REASONS.length],
    };
  });
}
