import { courses } from "@/lib/courses-data";
import { events } from "@/lib/events-data";
import { tournaments } from "@/lib/tournaments-data";

// ── Cleanup / archive domain ───────────────────────────────────────
// A single, unified view over the three course sources (חוגים, אירועים,
// תחרויות). Only the ones that already ended are offered for archiving.

export type CompletedKind = "חוג" | "אירוע" | "תחרות";

export interface CompletedCourse {
  id: string;
  kind: CompletedKind;
  name: string;
  /** Person in charge — coach / judge / "—" for plain events. */
  owner: string;
  /** Last known date, dd.mm.yyyy or "—". */
  date: string;
  room: string;
  daysLabel: string;
  /** Known weekly time window, e.g. "17:00–18:30". */
  timeRange: string;
  /** Rating / fitness range, or "—" when not applicable. */
  rangeLabel: string;
  /** Extra context line for the details dialog. */
  detailLabel: string;
}

/** Stable little hash so each course gets a consistent time window. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function timeRange(id: string): string {
  const start = 14 + (hash(id) % 5); // 14:00–18:00
  const half = hash(id) % 2 ? "30" : "00";
  const end = start + 1;
  return `${String(start).padStart(2, "0")}:${half}–${String(end + 1).padStart(2, "0")}:${half}`;
}

const endedClasses: CompletedCourse[] = courses
  .filter((a) => a.status === "לא פעיל")
  .map((a) => ({
    id: a.id,
    kind: "חוג",
    name: a.name,
    owner: a.coach,
    date: a.nextDate,
    room: a.room,
    daysLabel: a.days.join(", "),
    timeRange: timeRange(a.id),
    rangeLabel: `מד״כ ${a.fitnessMin}–${a.fitnessMax} · גיל ${a.ageMin}–${a.ageMax}`,
    detailLabel: `מדריך: ${a.coach}`,
  }));

const endedEvents: CompletedCourse[] = events
  .filter((e) => e.status === "הסתיים")
  .map((e) => ({
    id: e.id,
    kind: "אירוע",
    name: e.name,
    owner: "—",
    date: e.nextDate,
    room: e.room,
    daysLabel: e.days.join(", "),
    timeRange: timeRange(e.id),
    rangeLabel: "—",
    detailLabel: e.recurrence,
  }));

const endedTournaments: CompletedCourse[] = tournaments
  .filter((t) => t.status === "הסתיימה")
  .map((t) => ({
    id: t.id,
    kind: "תחרות",
    name: t.name,
    owner: t.judge,
    date: t.nextDate,
    room: t.room,
    daysLabel: t.days.join(", "),
    timeRange: timeRange(t.id),
    rangeLabel: `מד״כ ${t.ratingMin}–${t.ratingMax}`,
    detailLabel: `שופט: ${t.judge} · ${t.rounds} סיבובים · ${t.participants} משתתפים`,
  }));

export const completedCourses: CompletedCourse[] = [
  ...endedClasses,
  ...endedEvents,
  ...endedTournaments,
];
