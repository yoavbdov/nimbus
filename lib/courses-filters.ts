import {
  allCourseCoaches,
  allCourseStatuses,
  allCourseOccupancies,
  allCourseRooms,
  COURSE_DAYS,
  todayHebrewDay,
  type Course,
  type CourseDay,
} from "@/lib/courses-data";

export type FilterField =
  | "name"
  | "coach"
  | "ageMin"
  | "ageMax"
  | "ratingMin"
  | "ratingMax"
  | "enrolled"
  | "capacity"
  | "days"
  | "status"
  | "occupancy"
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

export interface CourseFilter {
  id: string;
  field: FilterField;
  op: string;
  value: string | number | string[] | null;
}

/**
 * Live option overrides per field. Used to replace the static mock-derived
 * dropdown options (מדריך/חדר) with the real values read from Firestore.
 */
export type FieldOptions = Partial<Record<FilterField, string[]>>;

const numericOps: OperatorDef[] = [
  { op: "equals", label: "שווה ל", valueMode: "number" },
  { op: "gt", label: "גדול מ", valueMode: "number" },
  { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
  { op: "lt", label: "קטן מ", valueMode: "number" },
  { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
];

export const FIELD_DEFS: FieldDef[] = [
  {
    field: "name",
    label: "שם החוג",
    basic: true,
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "text" },
      { op: "contains", label: "מכיל בתוכו", valueMode: "text" },
    ],
  },
  {
    field: "coach",
    label: "מדריך",
    basic: true,
    options: allCourseCoaches,
    operators: [
      { op: "is", label: "הוא", valueMode: "single-enum" },
      { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
      { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
      { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
    ],
  },
  { field: "ageMin", label: "גיל מינימלי", basic: true, operators: numericOps },
  { field: "ageMax", label: "גיל מקסימלי", operators: numericOps },
  { field: "ratingMin", label: "מד כושר מינימלי", basic: true, operators: numericOps },
  { field: "ratingMax", label: "מד כושר מקסימלי", operators: numericOps },
  { field: "enrolled", label: "רשומים", basic: true, operators: numericOps },
  { field: "capacity", label: "קיבולת", operators: numericOps },
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
  {
    field: "status",
    label: "סטטוס",
    basic: true,
    options: allCourseStatuses,
    operators: [
      { op: "is", label: "הוא", valueMode: "single-enum" },
      { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
      { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
      { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
    ],
  },
  {
    field: "occupancy",
    label: "תפוסה",
    basic: true,
    options: allCourseOccupancies,
    operators: [
      { op: "is", label: "הוא", valueMode: "single-enum" },
      { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
      { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
      { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
    ],
  },
  {
    field: "room",
    label: "חדר",
    options: allCourseRooms,
    operators: [
      { op: "is", label: "הוא", valueMode: "single-enum" },
      { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
      { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
      { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
    ],
  },
];

export const BASIC_FIELD_DEFS: FieldDef[] = FIELD_DEFS.filter((f) => f.basic);

export const FIELD_BY_KEY: Record<FilterField, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map((f) => [f.field, f]),
) as Record<FilterField, FieldDef>;

export function getOperator(field: FilterField, op: string): OperatorDef | undefined {
  return FIELD_BY_KEY[field].operators.find((o) => o.op === op);
}

export function formatValue(filter: CourseFilter): string {
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

function applyDaysFilter(days: CourseDay[], f: CourseFilter): boolean {
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

function applyFilter(a: Course, f: CourseFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = a.name.toLowerCase();
      const t = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === t : v.includes(t);
    }
    case "coach": {
      if (f.op === "is") return a.coach === f.value;
      if (f.op === "is_not") return a.coach !== f.value;
      const arr = Array.isArray(f.value) ? f.value : [];
      const has = arr.includes(a.coach);
      return f.op === "in" ? has : !has;
    }
    case "ageMin":
      return compareNumber(a.ageMin, f.op, Number(f.value));
    case "ageMax":
      return compareNumber(a.ageMax, f.op, Number(f.value));
    case "ratingMin":
      return compareNumber(a.ratingMin, f.op, Number(f.value));
    case "ratingMax":
      return compareNumber(a.ratingMax, f.op, Number(f.value));
    case "enrolled":
      return compareNumber(a.enrolled, f.op, Number(f.value));
    case "capacity":
      return compareNumber(a.capacity, f.op, Number(f.value));
    case "days":
      return applyDaysFilter(a.days, f);
    case "status": {
      if (f.op === "is") return a.status === f.value;
      if (f.op === "is_not") return a.status !== f.value;
      const arr = Array.isArray(f.value) ? f.value : [];
      const has = arr.includes(a.status);
      return f.op === "in" ? has : !has;
    }
    case "occupancy": {
      if (f.op === "is") return a.occupancy === f.value;
      if (f.op === "is_not") return a.occupancy !== f.value;
      const arr = Array.isArray(f.value) ? f.value : [];
      const has = arr.includes(a.occupancy);
      return f.op === "in" ? has : !has;
    }
    case "room": {
      if (f.op === "is") return a.room === f.value;
      if (f.op === "is_not") return a.room !== f.value;
      const arr = Array.isArray(f.value) ? f.value : [];
      const has = arr.includes(a.room);
      return f.op === "in" ? has : !has;
    }
  }
}

function matchesSearch(a: Course, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    a.name.toLowerCase().includes(q) || a.coach.toLowerCase().includes(q)
  );
}

export function filterCourses(
  list: Course[],
  query: string,
  filters: CourseFilter[],
  todayOnly: boolean,
): Course[] {
  const today = todayOnly ? todayHebrewDay() : null;
  return list.filter(
    (a) =>
      matchesSearch(a, query) &&
      filters.every((f) => applyFilter(a, f)) &&
      (today == null || (a.status === "פעיל" && a.days.includes(today))),
  );
}
