import type { Equipment } from "@/lib/rooms-data";
import {
  compareNumber,
  makeFilterSchema,
  numericOps,
  textOps,
  type FieldDef,
  type Filter,
} from "@/lib/filters/schema";

/** An active equipment filter (a named alias of the generic {@link Filter}). */
export type EquipmentFilter = Filter;

const FIELD_DEFS: FieldDef[] = [
  { field: "name", label: "שם ציוד", basic: true, operators: textOps },
  { field: "quantity", label: "כמות", basic: true, operators: numericOps },
  { field: "notes", label: "הערות", basic: true, operators: textOps },
];

/** Schema handed to the shared filter components for the equipment panel. */
export const equipmentFilterSchema = makeFilterSchema(FIELD_DEFS);

function applyText(value: string, op: string, target: string): boolean {
  const v = value.toLowerCase();
  const q = target.toLowerCase();
  return op === "equals" ? v === q : v.includes(q);
}

function applyFilter(e: Equipment, f: EquipmentFilter): boolean {
  switch (f.field) {
    case "name":
      return applyText(e.name, f.op, String(f.value ?? ""));
    case "quantity":
      return compareNumber(e.quantity, f.op, Number(f.value));
    case "notes":
      return applyText(e.notes, f.op, String(f.value ?? ""));
    default:
      return true;
  }
}

function matchesSearch(e: Equipment, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    e.name.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q)
  );
}

export function filterEquipmentAdvanced(
  equipment: Equipment[],
  query: string,
  filters: EquipmentFilter[],
): Equipment[] {
  return equipment.filter(
    (e) => matchesSearch(e, query) && filters.every((f) => applyFilter(e, f)),
  );
}
