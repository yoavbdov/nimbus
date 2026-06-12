import { rooms, type Room } from "@/lib/rooms-data";

export type FilterField = "name" | "capacity" | "equipment";

export type ValueMode = "none" | "text" | "number" | "single-enum" | "multi-enum";

export interface OperatorDef {
  op: string;
  label: string;
  valueMode: ValueMode;
}

export interface FieldDef {
  field: FilterField;
  label: string;
  operators: OperatorDef[];
  options?: string[];
  basic?: boolean;
}

export interface RoomFilter {
  id: string;
  field: FilterField;
  op: string;
  value: string | number | string[] | null;
}

const numericOps: OperatorDef[] = [
  { op: "equals", label: "שווה ל", valueMode: "number" },
  { op: "gt", label: "גדול מ", valueMode: "number" },
  { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
  { op: "lt", label: "קטן מ", valueMode: "number" },
  { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
];

export const allRoomEquipment: string[] = Array.from(
  new Set(rooms.flatMap((r) => r.equipment)),
).sort((a, b) => a.localeCompare(b, "he"));

export const FIELD_DEFS: FieldDef[] = [
  {
    field: "name",
    label: "שם חדר",
    basic: true,
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "text" },
      { op: "contains", label: "מכיל בתוכו", valueMode: "text" },
    ],
  },
  { field: "capacity", label: "קיבולת", basic: true, operators: numericOps },
  {
    field: "equipment",
    label: "ציוד מאחסן",
    basic: true,
    options: allRoomEquipment,
    operators: [
      { op: "any", label: "מכיל אחד מהבאים", valueMode: "multi-enum" },
      { op: "all", label: "מכיל את כל הבאים", valueMode: "multi-enum" },
      { op: "none", label: "לא מכיל אף אחד מהבאים", valueMode: "multi-enum" },
      { op: "is", label: "מכיל את", valueMode: "single-enum" },
    ],
  },
];

export const BASIC_FIELD_DEFS: FieldDef[] = FIELD_DEFS.filter((f) => f.basic);

export const HAS_ADVANCED_FIELDS = FIELD_DEFS.length > BASIC_FIELD_DEFS.length;

export const FIELD_BY_KEY: Record<FilterField, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map((f) => [f.field, f]),
) as Record<FilterField, FieldDef>;

export function getOperator(field: FilterField, op: string): OperatorDef | undefined {
  return FIELD_BY_KEY[field].operators.find((o) => o.op === op);
}

export function formatValue(filter: RoomFilter): string {
  if (filter.value == null) return "";
  if (Array.isArray(filter.value)) return filter.value.join(", ");
  return String(filter.value);
}

function compareNumber(a: number, op: string, b: number): boolean {
  if (op === "equals") return a === b;
  if (op === "gt") return a > b;
  if (op === "gte") return a >= b;
  if (op === "lt") return a < b;
  if (op === "lte") return a <= b;
  return false;
}

function applyEquipmentFilter(equipment: string[], f: RoomFilter): boolean {
  if (f.op === "is") {
    return equipment.includes(String(f.value ?? ""));
  }
  const arr = Array.isArray(f.value) ? f.value : [];
  if (arr.length === 0) return true;
  if (f.op === "any") return equipment.some((e) => arr.includes(e));
  if (f.op === "all") return arr.every((e) => equipment.includes(e));
  if (f.op === "none") return !equipment.some((e) => arr.includes(e));
  return false;
}

function applyFilter(r: Room, f: RoomFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = r.name.toLowerCase();
      const q = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === q : v.includes(q);
    }
    case "capacity":
      return compareNumber(r.capacity, f.op, Number(f.value));
    case "equipment":
      return applyEquipmentFilter(r.equipment, f);
  }
}

function matchesSearch(r: Room, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    r.name.toLowerCase().includes(q) ||
    r.equipment.some((e) => e.toLowerCase().includes(q))
  );
}

export function filterRoomsAdvanced(
  query: string,
  filters: RoomFilter[],
): Room[] {
  return rooms.filter(
    (r) => matchesSearch(r, query) && filters.every((f) => applyFilter(r, f)),
  );
}
