import { courses } from "@/lib/courses-data";
import { tournaments } from "@/lib/tournaments-data";
import { events } from "@/lib/events-data";
import type { EquipmentSlot } from "@/lib/equipment-availability";

/** Where a piece of equipment is in use. */
export type EquipmentUsageKind = "חוג" | "תחרות" | "אירוע";

export interface EquipmentUsage {
  id: string;
  name: string;
  kind: EquipmentUsageKind;
  /** How many units of the equipment this user occupies in the slot. */
  units: number;
}

/** Deterministic pseudo-hash so the same inputs always give the same answer. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

// One flat pool of every possible user, tagged by kind. No real backend links
// equipment to courses yet, so we derive a stable subset per equipment + slot.
const pool: { id: string; name: string; kind: EquipmentUsageKind }[] = [
  ...courses.map((a) => ({ id: a.id, name: a.name, kind: "חוג" as const })),
  ...tournaments.map((t) => ({ id: t.id, name: t.name, kind: "תחרות" as const })),
  ...events.map((e) => ({ id: e.id, name: e.name, kind: "אירוע" as const })),
];

/**
 * Mock lookup: which חוגים/תחרויות/אירועים occupy a given equipment item *in the
 * requested slot*, and how many units each one uses. The per-user units always
 * sum to `usedUnits` (= total quantity minus what's free), so the breakdown is
 * consistent with the availability result.
 */
export function equipmentUsage(
  equipmentId: string,
  slot: EquipmentSlot,
  usedUnits: number,
): EquipmentUsage[] {
  if (usedUnits <= 0) return [];

  const slotKey = `${slot.date}|${slot.startTime}|${slot.endTime}`;
  // Stable subset of users that fall on this equipment + slot.
  const candidates = pool.filter(
    (u) => hash(`${equipmentId}|${slotKey}|${u.id}`) % 3 === 0,
  );
  // Fall back to a single deterministic user if the filter caught none.
  const chosen =
    candidates.length > 0
      ? candidates
      : [pool[hash(`${equipmentId}|${slotKey}`) % pool.length]];

  // Can't have more users than units when each uses at least one.
  const userCount = Math.min(chosen.length, usedUnits);
  const base = Math.floor(usedUnits / userCount);
  const remainder = usedUnits % userCount;

  return chosen.slice(0, userCount).map((u, i) => ({
    ...u,
    units: base + (i < remainder ? 1 : 0),
  }));
}
