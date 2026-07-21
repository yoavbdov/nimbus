import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";

export type EventCategory = "חוג" | "תחרות" | "אירוע" | "ליגה";

export interface ScheduleEvent {
  /** Unique per occurrence: `${sessionId}__${date}`. */
  id: string;
  /** The parent record this occurrence belongs to (its Firestore id = name). */
  parentId: string;
  parentType: "course" | "tournament" | "event";
  title: string;
  category: EventCategory;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24h) */
  start: string;
  end: string;
  /** Course coach / tournament judge; empty for events. */
  coach: string;
  location: string;
  /** Names of the players attending this occurrence. */
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
