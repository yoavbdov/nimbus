import { players, allClubs, allStatuses, type Player } from "@/lib/players-data";

export type FilterField =
  | "name"
  | "phone"
  | "status"
  | "club"
  | "tournament"
  | "grade"
  | "leagueTeam"
  | "age"
  | "israeliRating"
  | "fideRating";

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

export interface PlayerFilter {
  id: string;
  field: FilterField;
  op: string;
  value: string | number | string[] | null;
}

const GRADE_ORDER = [
  "גן",
  "כיתה א",
  "כיתה ב",
  "כיתה ג",
  "כיתה ד",
  "כיתה ה",
  "כיתה ו",
  "כיתה ז",
  "כיתה ח",
  "כיתה ט",
  "כיתה י",
  "כיתה יא",
  "כיתה יב",
  "מבוגר",
];

function gradeRank(g: string): number {
  const i = GRADE_ORDER.indexOf(g);
  return i === -1 ? Number.POSITIVE_INFINITY : i;
}

const allTournaments = Array.from(
  new Set(players.flatMap((p) => p.tournaments)),
).sort((a, b) => a.localeCompare(b, "he"));

const allLeagueTeams = Array.from(
  new Set(players.map((p) => p.leagueTeam).filter((t): t is string => !!t)),
).sort((a, b) => a.localeCompare(b, "he"));

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
    options: allStatuses,
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
    options: allClubs,
    operators: [
      { op: "participates", label: "משתתף בחוג", valueMode: "single-enum" },
      { op: "not_participates", label: "לא משתתף בחוג", valueMode: "single-enum" },
      { op: "participates_any", label: "משתתף באחד החוגים", valueMode: "multi-enum" },
      { op: "not_participates_any", label: "לא משתתף באחד החוגים", valueMode: "multi-enum" },
      { op: "participates_none", label: "לא משתתף באף חוג", valueMode: "none" },
    ],
  },
  {
    field: "tournament",
    label: "תחרות",
    options: allTournaments,
    operators: [
      { op: "participates", label: "משתתף בתחרות", valueMode: "single-enum" },
      { op: "not_participates", label: "לא משתתף בתחרות", valueMode: "single-enum" },
      { op: "participates_any", label: "משתתף באחת התחרויות", valueMode: "multi-enum" },
      { op: "not_participates_any", label: "לא משתתף באחת התחרויות", valueMode: "multi-enum" },
      { op: "participates_none", label: "לא משתתף באף תחרות", valueMode: "none" },
    ],
  },
  {
    field: "grade",
    label: "כיתה",
    options: GRADE_ORDER,
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "single-enum" },
      { op: "not_equals", label: "לא שווה ל", valueMode: "single-enum" },
      { op: "above", label: "מעל", valueMode: "single-enum" },
      { op: "above_eq", label: "מעל או שווה ל", valueMode: "single-enum" },
      { op: "below", label: "מתחת", valueMode: "single-enum" },
      { op: "below_eq", label: "מתחת או שווה ל", valueMode: "single-enum" },
    ],
  },
  {
    field: "leagueTeam",
    label: "קבוצת ליגה",
    options: allLeagueTeams,
    operators: [
      { op: "in", label: "נמצא ב", valueMode: "multi-enum" },
      { op: "not_in", label: "לא נמצא ב", valueMode: "multi-enum" },
      { op: "none", label: "לא משתתף בליגה", valueMode: "none" },
    ],
  },
  {
    field: "age",
    label: "גיל",
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "number" },
      { op: "gt", label: "גדול מ", valueMode: "number" },
      { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
      { op: "lt", label: "מתחת ל", valueMode: "number" },
      { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
    ],
  },
  {
    field: "israeliRating",
    label: "דירוג ישראלי",
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "number" },
      { op: "gt", label: "גדול מ", valueMode: "number" },
      { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
      { op: "lt", label: "קטן מ", valueMode: "number" },
      { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
    ],
  },
  {
    field: "fideRating",
    label: "דירוג FIDE",
    operators: [
      { op: "equals", label: "שווה ל", valueMode: "number" },
      { op: "gt", label: "גדול מ", valueMode: "number" },
      { op: "gte", label: "גדול או שווה ל", valueMode: "number" },
      { op: "lt", label: "קטן מ", valueMode: "number" },
      { op: "lte", label: "קטן או שווה ל", valueMode: "number" },
    ],
  },
];

export const FIELD_BY_KEY: Record<FilterField, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map((f) => [f.field, f]),
) as Record<FilterField, FieldDef>;

export function getOperator(field: FilterField, op: string): OperatorDef | undefined {
  return FIELD_BY_KEY[field].operators.find((o) => o.op === op);
}

export function formatValue(filter: PlayerFilter): string {
  if (filter.value == null) return "";
  if (Array.isArray(filter.value)) return filter.value.join(", ");
  return String(filter.value);
}

function applyMembership(memberships: string[], f: PlayerFilter): boolean {
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

function compareNumber(a: number, op: string, b: number): boolean {
  if (op === "equals") return a === b;
  if (op === "gt") return a > b;
  if (op === "gte") return a >= b;
  if (op === "lt") return a < b;
  if (op === "lte") return a <= b;
  return false;
}

function applyFilter(p: Player, f: PlayerFilter): boolean {
  switch (f.field) {
    case "name": {
      const v = p.name.toLowerCase();
      const t = String(f.value ?? "").toLowerCase();
      return f.op === "equals" ? v === t : v.includes(t);
    }
    case "phone":
      return p.phone === String(f.value ?? "");
    case "status": {
      if (f.op === "is") return p.status === f.value;
      if (f.op === "is_not") return p.status !== f.value;
      const arr = Array.isArray(f.value) ? f.value : [];
      const has = arr.includes(p.status);
      return f.op === "in" ? has : !has;
    }
    case "club":
      return applyMembership(p.clubs, f);
    case "tournament":
      return applyMembership(p.tournaments, f);
    case "grade": {
      const target = String(f.value ?? "");
      if (f.op === "equals") return p.grade === target;
      if (f.op === "not_equals") return p.grade !== target;
      const a = gradeRank(p.grade);
      const b = gradeRank(target);
      if (!isFinite(a) || !isFinite(b)) return false;
      if (f.op === "above") return a > b;
      if (f.op === "above_eq") return a >= b;
      if (f.op === "below") return a < b;
      if (f.op === "below_eq") return a <= b;
      return false;
    }
    case "leagueTeam": {
      if (f.op === "none") return p.leagueTeam == null;
      const arr = Array.isArray(f.value) ? f.value : [];
      const inList = p.leagueTeam != null && arr.includes(p.leagueTeam);
      return f.op === "in" ? inList : !inList;
    }
    case "age":
      return compareNumber(p.age, f.op, Number(f.value));
    case "israeliRating":
      return compareNumber(p.israeliRating, f.op, Number(f.value));
    case "fideRating":
      return p.fideRating != null && compareNumber(p.fideRating, f.op, Number(f.value));
  }
}

function matchesSearch(p: Player, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q);
}

export function filterPlayers(query: string, filters: PlayerFilter[]): Player[] {
  return players.filter(
    (p) => matchesSearch(p, query) && filters.every((f) => applyFilter(p, f)),
  );
}
