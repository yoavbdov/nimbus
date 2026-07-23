import {
  allTournamentStatuses,
  type Tournament,
} from "@/lib/tournaments-data";
import {
  COURSE_DAYS,
  todayHebrewDay,
  type CourseDay,
} from "@/lib/courses-data";

export type FilterField =
  | "name"
  | "judge"
  | "status"
  | "rounds"
  | "days"
  | "participants"
  | "capacity"
  | "ratingMin"
  | "ratingMax"
  | "room";

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

export interface TournamentFilter {
  id: string;
  field: FilterField;
  op: string;
  value: string | number | string[] | null;
}

/**
 * Live option overrides per field. Used to replace the static mock-derived
 * dropdown options (שופט/חדר) with the real values read from Firestore.
 */
export type FieldOptions = Partial<Record<FilterField, string[]>>;

const numericOps: OperatorDef[] = [
  { op: "equals", label: "שווה ל", valueMode: "number" },
  { op: "gt", label: "גדול מ", valueMode: "number" },
  { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
  { op: "lt", label: "קטן מ", valueMode: "number" },
  { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
];

const enumOps: OperatorDef[] = [
  { op: "is", label: "הוא", valueMode: "single-enum" },
  { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
  { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
  { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
];

export const FIELD_DEFS: FieldDef[] = [
  {
    field: "name",
    label: "שם תחרות",
    basic: true,
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "text" },
      { op: "contains", label: "מכיל בתוכו", valueMode: "text" },
    ],
  },
  {
    field: "judge",
    label: "שופט",
    basic: true,
    // Filled live from Firestore via FieldOptions (see useTournamentsPanel).
    options: [],
    operators: enumOps,
  },
  {
    field: "status",
    label: "סטטוס",
    basic: true,
    options: allTournamentStatuses,
    operators: enumOps,
  },
  { field: "rounds", label: "סיבובים", operators: numericOps },
  {
    field: "days",
    label: "ימי פעילות",
    basic: true,
    options: [...COURSE_DAYS],
    operators: [
      { op: "any", label: "מתקיים באחד הימים", valueMode: "multi-enum" },
      { op: "all", label: "מתקיים בכל הימים", valueMode: "multi-enum" },
      { op: "none", label: "לא מתקיים באף יום", valueMode: "multi-enum" },
      { op: "is", label: "מתקיים ביום", valueMode: "single-enum" },
    ],
  },
  { field: "participants", label: "משתתפים", basic: true, operators: numericOps },
  { field: "capacity", label: "קיבולת", operators: numericOps },
  { field: "ratingMin", label: "דירוג מינימלי", operators: numericOps },
  { field: "ratingMax", label: "דירוג מקסימלי", operators: numericOps },
  {
    field: "room",
    label: "חדר",
    // Filled live from Firestore via FieldOptions (see useTournamentsPanel).
    options: [],
    operators: enumOps,
  },
];

export const BASIC_FIELD_DEFS: FieldDef[] = FIELD_DEFS.filter((f) => f.basic);

export const FIELD_BY_KEY: Record<FilterField, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map((f) => [f.field, f]),
) as Record<FilterField, FieldDef>;

export function getOperator(field: FilterField, op: string): OperatorDef | undefined {
  return FIELD_BY_KEY[field].operators.find((o) => o.op === op);
}

export function formatValue(filter: TournamentFilter): string {
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

function applyEnumFilter(value: string, f: TournamentFilter): boolean {
  if (f.op === "is") return value === f.value;
  if (f.op === "is_not") return value !== f.value;
  const arr = Array.isArray(f.value) ? f.value : [];
  const has = arr.includes(value);
  return f.op === "in" ? has : !has;
}

function applyDaysFilter(days: CourseDay[], f: TournamentFilter): boolean {
  if (f.op === "is") {
    return days.includes(String(f.value ?? "") as CourseDay);
  }
  const arr = Array.isArray(f.value) ? (f.value as CourseDay[]) : [];
  if (arr.length === 0) return true;
  if (f.op === "any") return days.some((d) => arr.includes(d));
  if (f.op === "all") return arr.every((d) => days.includes(d));
  if (f.op === "none") return !days.some((d) => arr.includes(d));
  return false;
}

function applyFilter(t: Tournament, f: TournamentFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = t.name.toLowerCase();
      const q = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === q : v.includes(q);
    }
    case "judge":
      return applyEnumFilter(t.judge, f);
    case "status":
      return applyEnumFilter(t.status, f);
    case "rounds":
      return compareNumber(t.rounds, f.op, Number(f.value));
    case "days":
      return applyDaysFilter(t.days, f);
    case "participants":
      return compareNumber(t.participants, f.op, Number(f.value));
    // An unlimited capacity compares as 0 — it matches no numeric bound.
    case "capacity":
      return compareNumber(t.capacity ?? 0, f.op, Number(f.value));
    case "ratingMin":
      return compareNumber(t.ratingMin, f.op, Number(f.value));
    case "ratingMax":
      return compareNumber(t.ratingMax, f.op, Number(f.value));
    case "room":
      return applyEnumFilter(t.room, f);
  }
}

function matchesSearch(t: Tournament, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    t.name.toLowerCase().includes(q) || t.judge.toLowerCase().includes(q)
  );
}

export function filterTournaments(
  list: Tournament[],
  query: string,
  filters: TournamentFilter[],
  todayOnly: boolean,
): Tournament[] {
  const today = todayOnly ? todayHebrewDay() : null;
  return list.filter(
    (t) =>
      matchesSearch(t, query) &&
      filters.every((f) => applyFilter(t, f)) &&
      (today == null || (t.status === "פעילה" && t.days.includes(today))),
  );
}
