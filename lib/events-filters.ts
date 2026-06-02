import {
  events,
  allEventStatuses,
  allEventRecurrences,
  allEventRooms,
  type ClubEvent,
} from "@/lib/events-data";
import {
  ACTIVITY_DAYS,
  todayHebrewDay,
  type ActivityDay,
} from "@/lib/activities-data";

export type FilterField = "name" | "days" | "status" | "recurrence" | "room";

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

export interface EventFilter {
  id: string;
  field: FilterField;
  op: string;
  value: string | number | string[] | null;
}

const enumOps: OperatorDef[] = [
  { op: "is", label: "הוא", valueMode: "single-enum" },
  { op: "is_not", label: "הוא לא", valueMode: "single-enum" },
  { op: "in", label: "הוא אחד מהבאים", valueMode: "multi-enum" },
  { op: "not_in", label: "הוא לא אחד מהבאים", valueMode: "multi-enum" },
];

export const FIELD_DEFS: FieldDef[] = [
  {
    field: "name",
    label: "שם אירוע",
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "text" },
      { op: "contains", label: "מכיל בתוכו", valueMode: "text" },
    ],
  },
  {
    field: "days",
    label: "ימי פעילות",
    options: [...ACTIVITY_DAYS],
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
    options: allEventStatuses,
    operators: enumOps,
  },
  {
    field: "recurrence",
    label: "קבוע/חד פעמי",
    options: allEventRecurrences,
    operators: enumOps,
  },
  {
    field: "room",
    label: "חדר",
    options: allEventRooms,
    operators: enumOps,
  },
];

export const FIELD_BY_KEY: Record<FilterField, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map((f) => [f.field, f]),
) as Record<FilterField, FieldDef>;

export function getOperator(field: FilterField, op: string): OperatorDef | undefined {
  return FIELD_BY_KEY[field].operators.find((o) => o.op === op);
}

export function formatValue(filter: EventFilter): string {
  if (filter.value == null) return "";
  if (Array.isArray(filter.value)) return filter.value.join(", ");
  return String(filter.value);
}

function applyEnumFilter(value: string, f: EventFilter): boolean {
  if (f.op === "is") return value === f.value;
  if (f.op === "is_not") return value !== f.value;
  const arr = Array.isArray(f.value) ? f.value : [];
  const has = arr.includes(value);
  return f.op === "in" ? has : !has;
}

function applyDaysFilter(days: ActivityDay[], f: EventFilter): boolean {
  if (f.op === "is") {
    return days.includes(String(f.value ?? "") as ActivityDay);
  }
  const arr = Array.isArray(f.value) ? (f.value as ActivityDay[]) : [];
  if (arr.length === 0) return true;
  if (f.op === "any") return days.some((d) => arr.includes(d));
  if (f.op === "all") return arr.every((d) => days.includes(d));
  if (f.op === "none") return !days.some((d) => arr.includes(d));
  return false;
}

function applyFilter(e: ClubEvent, f: EventFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = e.name.toLowerCase();
      const q = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === q : v.includes(q);
    }
    case "days":
      return applyDaysFilter(e.days, f);
    case "status":
      return applyEnumFilter(e.status, f);
    case "recurrence":
      return applyEnumFilter(e.recurrence, f);
    case "room":
      return applyEnumFilter(e.room, f);
  }
}

function matchesSearch(e: ClubEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return e.name.toLowerCase().includes(q) || e.room.toLowerCase().includes(q);
}

export function filterEvents(
  query: string,
  filters: EventFilter[],
  todayOnly: boolean,
): ClubEvent[] {
  const today = todayOnly ? todayHebrewDay() : null;
  return events.filter(
    (e) =>
      matchesSearch(e, query) &&
      filters.every((f) => applyFilter(e, f)) &&
      (today == null || (e.status === "פעיל" && e.days.includes(today))),
  );
}
