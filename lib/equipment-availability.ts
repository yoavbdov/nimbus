import type { Equipment } from "@/lib/rooms-data";

/** The time slot to check equipment against. Same shape as the rooms slot. */
export interface EquipmentSlot {
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/** Result of checking a single equipment item against a slot. */
export interface EquipmentAvailability {
  equipmentId: string;
  name: string;
  /** Total units in inventory. */
  quantity: number;
  /** How many of those units are free in the requested slot. */
  freeCount: number;
}

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
 * free quantity (0..quantity) from the item id and the requested slot.
 */
export function checkEquipmentAvailability(
  equipment: Equipment[],
  slot: EquipmentSlot,
): EquipmentAvailability[] {
  return equipment.map((item) => {
    const h = hash(`${item.id}|${slot.date}|${slot.startTime}|${slot.endTime}`);
    return {
      equipmentId: item.id,
      name: item.name,
      quantity: item.quantity,
      freeCount: h % (item.quantity + 1),
    };
  });
}

/** Sum of free units across the whole result. */
export function totalFree(result: EquipmentAvailability[]): number {
  return result.reduce((sum, item) => sum + item.freeCount, 0);
}

/** True once the slot has a date and a valid start-before-end time range. */
export function isEquipmentSlotValid(slot: EquipmentSlot): boolean {
  return (
    slot.date !== "" &&
    slot.startTime !== "" &&
    slot.endTime !== "" &&
    slot.startTime < slot.endTime
  );
}
