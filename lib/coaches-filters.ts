import { allCoachStatuses, type Coach } from "@/lib/coaches-data";

export type FilterField = "name" | "phone" | "status" | "club" | "clubCount";

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
}

export interface CoachFilter {
  id: string;
  field: FilterField;
  op: string;
  value: string | number | string[] | null;
}

/**
 * Live option overrides per field. Used to replace the static mock-derived
 * dropdown options (חוג) with the real course names read from Firestore.
 */
export type FieldOptions = Partial<Record<FilterField, string[]>>;

export const FIELD_DEFS: FieldDef[] = [
  {
    field: "name",
    label: "שם",
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "text" },
      { op: "contains", label: "מכיל בתוכו", valueMode: "text" },
    ],
  },
  {
    field: "phone",
    label: "טלפון",
    operators: [{ op: "equals", label: "שווה ל", valueMode: "text" }],
  },
  {
    field: "status",
    label: "סטטוס",
    options: allCoachStatuses,
    operators: [
      { op: "is", label: "הוא", valueMode: "single-enum" },
      { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
      { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
      { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
    ],
  },
  {
    field: "club",
    label: "חוג",
    // Filled live from Firestore via FieldOptions (see useCoachesPanel).
    options: [],
    operators: [
      { op: "participates", label: "מדריך בחוג", valueMode: "single-enum" },
      { op: "not_participates", label: "לא מדריך בחוג", valueMode: "single-enum" },
      { op: "participates_any", label: "מדריך באחד החוגים", valueMode: "multi-enum" },
      { op: "not_participates_any", label: "לא מדריך באחד החוגים", valueMode: "multi-enum" },
      { op: "participates_none", label: "לא מדריך באף חוג", valueMode: "none" },
    ],
  },
  {
    field: "clubCount",
    label: "מספר חוגים",
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "number" },
      { op: "gt", label: "גדול מ", valueMode: "number" },
      { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
      { op: "lt", label: "קטן מ", valueMode: "number" },
      { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
    ],
  },
];

function compareNumber(a: number, op: string, b: number): boolean {
  if (op === "equals") return a === b;
  if (op === "gt") return a > b;
  if (op === "gte") return a >= b;
  if (op === "lt") return a < b;
  if (op === "lte") return a <= b;
  return false;
}

export const FIELD_BY_KEY: Record<FilterField, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map((f) => [f.field, f]),
) as Record<FilterField, FieldDef>;

export function getOperator(field: FilterField, op: string): OperatorDef | undefined {
  return FIELD_BY_KEY[field].operators.find((o) => o.op === op);
}

export function formatValue(filter: CoachFilter): string {
  if (filter.value == null) return "";
  if (Array.isArray(filter.value)) return filter.value.join(", ");
  return String(filter.value);
}

function applyMembership(memberships: string[], f: CoachFilter): boolean {
  if (f.op === "participates_none") return memberships.length === 0;
  if (f.op === "participates_any" || f.op === "not_participates_any") {
    const arr = Array.isArray(f.value) ? f.value : [];
    const any = memberships.some((m) => arr.includes(m));
    return f.op === "participates_any" ? any : !any;
  }
  const single = String(f.value ?? "");
  const has = memberships.includes(single);
  return f.op === "participates" ? has : !has;
}

function applyFilter(c: Coach, f: CoachFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = c.name.toLowerCase();
      const t = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === t : v.includes(t);
    }
    case "phone":
      return c.phone === String(f.value ?? "");
    case "status": {
      if (f.op === "is") return c.status === f.value;
      if (f.op === "is_not") return c.status !== f.value;
      const arr = Array.isArray(f.value) ? f.value : [];
      const has = arr.includes(c.status);
      return f.op === "in" ? has : !has;
    }
    case "club":
      return applyMembership(c.courses, f);
    case "clubCount":
      return compareNumber(c.courses.length, f.op, Number(f.value));
  }
}

function matchesSearch(c: Coach, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
}

export function filterCoaches(
  coaches: Coach[],
  query: string,
  filters: CoachFilter[],
): Coach[] {
  return coaches.filter(
    (c) => matchesSearch(c, query) && filters.every((f) => applyFilter(c, f)),
  );
}
