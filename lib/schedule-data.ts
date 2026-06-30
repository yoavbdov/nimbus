import { startOfMonth, toISODate } from "@/lib/calendar";
import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";

export type EventCategory = "חוג" | "תחרות" | "אירוע" | "ליגה";

export interface ScheduleEvent {
  id: string;
  title: string;
  category: EventCategory;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24h) */
  start: string;
  end: string;
  coach: string;
  location: string;
  /** Players attending this session (mock data). */
  players: string[];
}

interface CategoryMeta {
  label: EventCategory;
  /** Solid accent (dot / left edge). */
  color: string;
  /** Soft fill for the chip background. */
  soft: string;
}

// Each category owns a hue so the month grid reads at a glance.
export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  חוג: { label: "חוג", color: "oklch(0.62 0.2 278)", soft: "oklch(0.62 0.2 278 / 0.14)" },
  תחרות: { label: "תחרות", color: "oklch(0.58 0.2 22)", soft: "oklch(0.58 0.2 22 / 0.15)" },
  אירוע: { label: "אירוע", color: "oklch(0.58 0.15 158)", soft: "oklch(0.62 0.15 158 / 0.15)" },
  ליגה: { label: "ליגה", color: "oklch(0.62 0.16 220)", soft: "oklch(0.62 0.16 220 / 0.14)" },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];

// ── Mock players ────────────────────────────────────────────────────
// The schedule data ships no roster, so we keep a small pool and attach a
// deterministic handful of players to every session for the player filter.
const PLAYER_POOL = [
  "דניאל כהן",
  "מאיה לוי",
  "איתי בר",
  "נועה שלו",
  "יונתן רז",
  "תמר אבני",
  "עומר דגן",
  "שירה פז",
  "אורי נחום",
  "ליה מזרחי",
  "גיא הראל",
  "רוני אלון",
] as const;

/** A stable hash for a string — used to pick players deterministically. */
function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Picks 2–3 distinct players for an event, deterministic in its id. */
function playersForEvent(id: string): string[] {
  const h = hashString(id);
  const count = 2 + (h % 2); // 2 or 3
  const players: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = PLAYER_POOL[(h + i * 5) % PLAYER_POOL.length];
    if (!players.includes(name)) players.push(name);
  }
  return players;
}

// A repeating weekly template — keyed by weekday (0 = Sunday) so the month is
// always populated no matter which month the user navigates to.
interface Template {
  weekday: number;
  title: string;
  category: EventCategory;
  start: string;
  end: string;
  coach: string;
  location: string;
}

const WEEKLY_TEMPLATES: Template[] = [
  { weekday: 0, title: "שחמט מתחילים", category: "חוג", start: "16:00", end: "17:30", coach: "אבי לוי", location: "כיתה א׳" },
  { weekday: 0, title: "חוג גן", category: "חוג", start: "17:00", end: "18:00", coach: "ליאת מור", location: "כיתה ב׳" },
  { weekday: 1, title: "שחמט מתקדמים", category: "חוג", start: "16:30", end: "18:00", coach: "יוסי בן עמי", location: "אולם ראשי" },
  { weekday: 1, title: "אימון קבוצת ליגה", category: "ליגה", start: "18:30", end: "20:00", coach: "נדב אורן", location: "אולם תחרויות" },
  { weekday: 2, title: "שחמט בוגרים", category: "חוג", start: "19:00", end: "20:30", coach: "רון פרידמן", location: "אולם ראשי" },
  { weekday: 2, title: "כיתות נמוכות", category: "חוג", start: "15:30", end: "16:30", coach: "אלון זיו", location: "כיתה א׳" },
  { weekday: 3, title: "סדנת פתיחות", category: "חוג", start: "17:00", end: "18:30", coach: "אורן שגב", location: "אולם ראשי" },
  { weekday: 3, title: "הכנה לתחרויות", category: "תחרות", start: "18:30", end: "20:00", coach: "מתן יערי", location: "אולם תחרויות" },
  { weekday: 4, title: "מועדון אחה״צ", category: "חוג", start: "16:00", end: "17:30", coach: "מירב כהן", location: "כיתה ב׳" },
  { weekday: 4, title: "טורניר חמישי", category: "תחרות", start: "18:00", end: "21:00", coach: "אייל סופר", location: "אולם תחרויות" },
  { weekday: 5, title: "חוג שישי", category: "חוג", start: "10:00", end: "11:30", coach: "רעות שני", location: "כיתה א׳" },
  { weekday: 6, title: "מפגש סוף שבוע", category: "אירוע", start: "11:00", end: "13:00", coach: "שירה גל", location: "אולם ראשי" },
];

// One-off highlights, placed by day-of-month so a few special days stand out.
interface SpecialTemplate {
  dayOfMonth: number;
  title: string;
  category: EventCategory;
  start: string;
  end: string;
  coach: string;
  location: string;
}

const SPECIAL_TEMPLATES: SpecialTemplate[] = [
  { dayOfMonth: 7, title: "מבחן דירוג ארצי", category: "אירוע", start: "09:00", end: "14:00", coach: "ועדת הדירוג", location: "אולם תחרויות" },
  { dayOfMonth: 14, title: "גביע המועדון", category: "תחרות", start: "09:00", end: "16:00", coach: "צוות שיפוט", location: "אולם תחרויות" },
  { dayOfMonth: 18, title: "הרצאת אורח", category: "אירוע", start: "19:00", end: "20:30", coach: "GM אורח", location: "אולם ראשי" },
  { dayOfMonth: 24, title: "מבחן דירוג פנימי", category: "אירוע", start: "16:00", end: "19:00", coach: "מעיין דקל", location: "כיתה ב׳" },
  { dayOfMonth: 28, title: "ליגת נוער", category: "ליגה", start: "10:00", end: "15:00", coach: "גיא רביב", location: "אולם תחרויות" },
];

/**
 * Builds a deterministic set of events for the three months surrounding
 * `anchor` (previous, current, next) so navigation always lands on a populated
 * view. Pure function of the anchor — no randomness.
 */
export function buildEvents(anchor: Date): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];

  for (let monthOffset = -1; monthOffset <= 1; monthOffset++) {
    const monthStart = startOfMonth(
      new Date(anchor.getFullYear(), anchor.getMonth() + monthOffset, 1),
    );
    const daysInMonth = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const iso = toISODate(date);

      for (const t of WEEKLY_TEMPLATES) {
        if (t.weekday !== date.getDay()) continue;
        const id = `${iso}-${t.title}-${t.start}`;
        events.push({
          id,
          title: t.title,
          category: t.category,
          date: iso,
          start: t.start,
          end: t.end,
          coach: t.coach,
          location: t.location,
          players: playersForEvent(id),
        });
      }

      const special = SPECIAL_TEMPLATES.find((s) => s.dayOfMonth === day);
      if (special) {
        const id = `${iso}-special-${special.title}`;
        events.push({
          id,
          title: special.title,
          category: special.category,
          date: iso,
          start: special.start,
          end: special.end,
          coach: special.coach,
          location: special.location,
          players: playersForEvent(id),
        });
      }
    }
  }

  return events;
}

// ── Facet filters ───────────────────────────────────────────────────
// Each facet is one filterable dimension. Within a facet the selected values
// combine with OR; across facets they combine with AND.
export type FacetKey =
  | "player"
  | "class"
  | "coach"
  | "room"
  | "competition"
  | "event";

interface FacetDef {
  key: FacetKey;
  label: string;
  /** Pull this event's values for the facet (usually one, players are many). */
  valuesOf: (event: ScheduleEvent) => string[];
}

export const SCHEDULE_FACETS: FacetDef[] = [
  { key: "player", label: "שחקן", valuesOf: (e) => e.players },
  {
    key: "class",
    label: "חוג",
    valuesOf: (e) => (e.category === "חוג" ? [e.title] : []),
  },
  { key: "coach", label: "מדריך", valuesOf: (e) => [e.coach] },
  { key: "room", label: "חדר", valuesOf: (e) => [e.location] },
  {
    key: "competition",
    label: "תחרות",
    valuesOf: (e) => (e.category === "תחרות" ? [e.title] : []),
  },
  {
    key: "event",
    label: "אירוע",
    valuesOf: (e) => (e.category === "אירוע" ? [e.title] : []),
  },
];

export const FACET_KEYS = SCHEDULE_FACETS.map((f) => f.key);

const FACET_BY_KEY = Object.fromEntries(
  SCHEDULE_FACETS.map((f) => [f.key, f]),
) as Record<FacetKey, FacetDef>;

/** The sorted, distinct option list for every facet, derived from the events. */
export function buildFacetOptions(
  events: ScheduleEvent[],
): Record<FacetKey, string[]> {
  const sets: Record<FacetKey, Set<string>> = {
    player: new Set(),
    class: new Set(),
    coach: new Set(),
    room: new Set([OUTSIDE_CLUB_ROOM]),
    competition: new Set(),
    event: new Set(),
  };
  for (const event of events) {
    for (const facet of SCHEDULE_FACETS) {
      for (const value of facet.valuesOf(event)) sets[facet.key].add(value);
    }
  }
  const out = {} as Record<FacetKey, string[]>;
  for (const key of FACET_KEYS) {
    out[key] = [...sets[key]].sort((a, b) => a.localeCompare(b, "he"));
  }
  return out;
}

/** Whether an event matches a facet given the set of selected values (OR). */
export function eventMatchesFacet(
  event: ScheduleEvent,
  key: FacetKey,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true;
  return FACET_BY_KEY[key].valuesOf(event).some((v) => selected.has(v));
}

export function sortEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) =>
    a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date),
  );
}

/** "HH:MM" → minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** An event placed into a lane so overlapping sessions sit side by side. */
export interface PositionedEvent {
  event: ScheduleEvent;
  lane: number;
  lanes: number;
}

/**
 * Greedy interval-graph layout: events that overlap in time form a cluster and
 * are spread across as many lanes as the deepest overlap, exactly like the
 * side-by-side blocks in Outlook / Google Calendar.
 */
export function layoutDayEvents(events: ScheduleEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );

  const result: PositionedEvent[] = [];
  let cluster: { event: ScheduleEvent; lane: number }[] = [];
  let clusterEnd = -1;
  let laneEnds: number[] = [];

  const flush = () => {
    const lanes = laneEnds.length;
    for (const c of cluster) result.push({ ...c, lanes });
    cluster = [];
    laneEnds = [];
    clusterEnd = -1;
  };

  for (const event of sorted) {
    const start = timeToMinutes(event.start);
    const end = timeToMinutes(event.end);

    if (cluster.length && start >= clusterEnd) flush();

    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    cluster.push({ event, lane });
    clusterEnd = Math.max(clusterEnd, end);
  }
  if (cluster.length) flush();

  return result;
}
