import type { Room } from "@/lib/rooms-data";

/** The time slot to check rooms against. */
export interface RoomSlot {
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/** Result of checking a single room against a slot. */
export interface RoomAvailability {
  roomId: string;
  name: string;
  available: boolean;
  /** Reason shown when the room is busy. */
  reason: string | null;
}

const BUSY_REASONS = [
  "אימון קבוצתי",
  "טורניר פנימי",
  "הרצאה",
  "סדנה",
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
 * answer from the room id and the requested slot. Roughly 60% are free.
 */
export function checkRoomAvailability(
  rooms: Room[],
  slot: RoomSlot,
): RoomAvailability[] {
  return rooms.map((room) => {
    const h = hash(`${room.id}|${slot.date}|${slot.startTime}|${slot.endTime}`);
    const available = h % 10 < 6;
    return {
      roomId: room.id,
      name: room.name,
      available,
      reason: available ? null : BUSY_REASONS[h % BUSY_REASONS.length],
    };
  });
}

/** True once the slot has a date and a valid start-before-end time range. */
export function isRoomSlotValid(slot: RoomSlot): boolean {
  return (
    slot.date !== "" &&
    slot.startTime !== "" &&
    slot.endTime !== "" &&
    slot.startTime < slot.endTime
  );
}
