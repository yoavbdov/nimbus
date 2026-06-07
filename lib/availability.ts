import type { Player } from "@/lib/players-data";

/** The time slot the coach wants to check players against. */
export interface AvailabilitySlot {
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/** Result of checking a single player against a slot. */
export interface PlayerAvailability {
  playerId: string;
  name: string;
  available: boolean;
  /** Reason shown when the player is busy. */
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
 * answer from the player id and the requested slot. Roughly 60% are free.
 */
export function checkAvailability(
  players: Player[],
  slot: AvailabilitySlot,
): PlayerAvailability[] {
  return players.map((player) => {
    const h = hash(`${player.id}|${slot.date}|${slot.startTime}|${slot.endTime}`);
    const available = h % 10 < 6;
    return {
      playerId: player.id,
      name: player.name,
      available,
      reason: available ? null : BUSY_REASONS[h % BUSY_REASONS.length],
    };
  });
}

/** True once the slot has a date and a valid start-before-end time range. */
export function isSlotValid(slot: AvailabilitySlot): boolean {
  return (
    slot.date !== "" &&
    slot.startTime !== "" &&
    slot.endTime !== "" &&
    slot.startTime < slot.endTime
  );
}
