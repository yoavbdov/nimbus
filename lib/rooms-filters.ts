import type { Room } from "@/lib/rooms-data";
import {
  compareNumber,
  makeFilterSchema,
  numericOps,
  textOps,
  type FieldDef,
  type Filter,
} from "@/lib/filters/schema";

/** An active rooms filter (kept as a named alias of the generic {@link Filter}). */
export type RoomFilter = Filter;

const FIELD_DEFS: FieldDef[] = [
  { field: "name", label: "שם חדר", basic: true, operators: textOps },
  { field: "capacity", label: "קיבולת", basic: true, operators: numericOps },
];

/** Schema handed to the shared filter components for the rooms panel. */
export const roomsFilterSchema = makeFilterSchema(FIELD_DEFS);

function applyFilter(r: Room, f: RoomFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = r.name.toLowerCase();
      const q = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === q : v.includes(q);
    }
    case "capacity":
      // A room with no stated capacity counts as 0, same as an activity with no
      // capacity in the courses / tournaments filters.
      return compareNumber(r.capacity ?? 0, f.op, Number(f.value));
    default:
      return true;
  }
}

function matchesSearch(r: Room, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return r.name.toLowerCase().includes(q);
}

export function filterRoomsAdvanced(
  rooms: Room[],
  query: string,
  filters: RoomFilter[],
): Room[] {
  return rooms.filter(
    (r) => matchesSearch(r, query) && filters.every((f) => applyFilter(r, f)),
  );
}
