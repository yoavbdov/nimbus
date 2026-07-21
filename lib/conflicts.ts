/**
 * Pure conflict detection between scheduled sessions — never talks to Firestore
 * (the live reads live in `hooks/schedule/useScheduleConflicts.ts`). Two
 * activities conflict when they overlap in time AND fight over the same
 * resource:
 *
 *   • room conflict:  same room (a real room, never "מחוץ למועדון").
 *   • coach conflict: same instructor — a course's coach or a tournament's
 *     judge (the same human); events have no instructor, so room only.
 *
 * A session belonging to the SAME activity is never a conflict with itself.
 *
 * Two flavours share the room/coach rule:
 *   - the calendar works on already-expanded, concretely-dated occurrences, so a
 *     conflict is just two occurrences on the same date whose times overlap.
 *   - the create/edit modal works on recurrence rules (a meeting may repeat
 *     open-endedly), so it compares by rule: same weekday + overlapping time +
 *     overlapping date-range.
 */
import {
  timeToMinutes,
  type EventCategory,
  type ScheduleEvent,
} from "@/lib/schedule-data";
import { hebrewDayFromIso, type SessionDoc } from "@/lib/sessions-data";
import { occurrencesInRange } from "@/lib/schedule-events";
import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";

/** Which resource two activities are fighting over. */
export type ConflictKind = "room" | "coach";

/** One activity that clashes with the activity in question. */
export interface ConflictPartner {
  /** The clashing activity's id (= its display name). */
  parentId: string;
  title: string;
  category: EventCategory;
  /** Which resources clash (room / coach); usually one, occasionally both. */
  kinds: ConflictKind[];
  /** The shared room name, when the clash includes a room. */
  roomName?: string;
  /** The shared instructor name, when the clash includes a coach/judge. */
  coachName?: string;
  /** A representative clashing occurrence, for display. */
  date: string;
  start: string;
  end: string;
}

/** The activity category a session's parent type maps to. */
export function categoryOfParentType(
  parentType: SessionDoc["parentType"],
): EventCategory {
  if (parentType === "course") return "חוג";
  if (parentType === "tournament") return "תחרות";
  return "אירוע";
}

/** Whether two [start,end) time windows (HH:mm) overlap at all. */
export function timesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return (
    timeToMinutes(aStart) < timeToMinutes(bEnd) &&
    timeToMinutes(bStart) < timeToMinutes(aEnd)
  );
}

/** Same real room — a shared "מחוץ למועדון" is never a room conflict. */
function sameRoom(a: string, b: string): boolean {
  return Boolean(a) && a === b && a !== OUTSIDE_CLUB_ROOM;
}

/** Same non-empty instructor (course coach / tournament judge). */
function sameCoach(a: string, b: string): boolean {
  return Boolean(a) && a === b;
}

// ── Calendar: conflicts between concretely-dated occurrences ────────────────

function addPartner(
  map: Map<string, ConflictPartner[]>,
  occurrenceId: string,
  partner: ConflictPartner,
) {
  const list = map.get(occurrenceId);
  if (list) list.push(partner);
  else map.set(occurrenceId, [partner]);
}

function partnerFromEvent(
  other: ScheduleEvent,
  kinds: ConflictKind[],
): ConflictPartner {
  return {
    parentId: other.parentId,
    title: other.title,
    category: other.category,
    kinds,
    roomName: kinds.includes("room") ? other.location : undefined,
    coachName: kinds.includes("coach") ? other.coach : undefined,
    date: other.date,
    start: other.start,
    end: other.end,
  };
}

/**
 * Maps each occurrence id to the occurrences it clashes with. Occurrences are
 * grouped by date, then every overlapping pair within a date that shares a room
 * or an instructor is recorded on both sides. Computed over the FULL event set
 * (not the filtered view) so a visible block still shows a clash with a partner
 * that a category/facet filter has hidden.
 */
export function conflictsForCalendar(
  events: ScheduleEvent[],
): Map<string, ConflictPartner[]> {
  const byDate = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const list = byDate.get(event.date);
    if (list) list.push(event);
    else byDate.set(event.date, [event]);
  }

  const result = new Map<string, ConflictPartner[]>();
  for (const dayEvents of byDate.values()) {
    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        const a = dayEvents[i];
        const b = dayEvents[j];
        if (a.parentId === b.parentId) continue; // same activity — not a clash
        if (!timesOverlap(a.start, a.end, b.start, b.end)) continue;

        const kinds: ConflictKind[] = [];
        if (sameRoom(a.location, b.location)) kinds.push("room");
        if (sameCoach(a.coach, b.coach)) kinds.push("coach");
        if (kinds.length === 0) continue;

        addPartner(result, a.id, partnerFromEvent(b, kinds));
        addPartner(result, b.id, partnerFromEvent(a, kinds));
      }
    }
  }
  return result;
}

// ── Modal: conflicts between concrete occurrences (draft vs persisted) ──────

/** One concrete day two activities clash on, with the overlapping time window. */
export interface ClashOccurrence {
  date: string; // YYYY-MM-DD
  day: string; // Hebrew weekday
  start: string; // overlap window start (HH:mm)
  end: string; // overlap window end (HH:mm)
}

/** A clash surfaced inside the create/edit modal, with WHEN it happens. */
export interface DraftConflict {
  parentId: string;
  title: string;
  category: EventCategory;
  kinds: ConflictKind[];
  roomName?: string;
  coachName?: string;
  /** The nearest clash from the window start; `null` only if none in window. */
  next: ClashOccurrence | null;
  /** Distinct clash dates within the window. */
  count: number;
  /** Whether the clash recurs (more than one date in the window). */
  recurring: boolean;
}

/** The later start / earlier end of two windows — their overlap (HH:mm sorts). */
function overlapWindow(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): { start: string; end: string } {
  return {
    start: aStart > bStart ? aStart : bStart,
    end: aEnd < bEnd ? aEnd : bEnd,
  };
}

/** What a draft session clashes with one other session on — accumulated. */
interface Accum {
  title: string;
  category: EventCategory;
  kinds: Set<ConflictKind>;
  roomName?: string;
  coachName?: string;
  /** Clash date → its overlap window, deduped across the draft's sessions. */
  byDate: Map<string, { start: string; end: string }>;
}

/**
 * Every activity a draft would clash with, and WHEN. Each of the draft's own
 * sessions is expanded into concrete dates in [`rangeStart`,`rangeEnd`] and
 * matched against every persisted session's dates (the edited activity's own
 * sessions must be excluded by the caller via `otherSessions`): a clash is a
 * shared date whose times overlap on the same real room or the same instructor
 * (`draftCoach`, empty for events). Results merge per clashing activity, keyed
 * by date so the same day is never counted twice; `resolveParent` returns
 * `null` for archived/missing parents, which are skipped.
 */
export function draftConflicts(
  draftSessions: SessionDoc[],
  draftCoach: string,
  otherSessions: SessionDoc[],
  instructorOf: (parentId: string) => string,
  resolveParent: (
    session: SessionDoc,
  ) => { title: string; category: EventCategory } | null,
  rangeStart: string,
  rangeEnd: string,
): DraftConflict[] {
  const byParent = new Map<string, Accum>();

  for (const draft of draftSessions) {
    if (!draft.date || !draft.start || !draft.end) continue; // half-filled row
    const draftDates = new Set(occurrencesInRange(draft, rangeStart, rangeEnd));
    if (draftDates.size === 0) continue;

    for (const other of otherSessions) {
      if (other.parentId === draft.parentId) continue;
      if (!timesOverlap(draft.start, draft.end, other.start, other.end)) continue;

      const roomClash = sameRoom(draft.roomId, other.roomId);
      const coachClash = sameCoach(draftCoach, instructorOf(other.parentId));
      if (!roomClash && !coachClash) continue;

      const shared = occurrencesInRange(other, rangeStart, rangeEnd).filter((d) =>
        draftDates.has(d),
      );
      if (shared.length === 0) continue;

      const parent = resolveParent(other);
      if (!parent) continue;

      let accum = byParent.get(other.parentId);
      if (!accum) {
        accum = {
          title: parent.title,
          category: parent.category,
          kinds: new Set(),
          byDate: new Map(),
        };
        byParent.set(other.parentId, accum);
      }
      if (roomClash) {
        accum.kinds.add("room");
        accum.roomName = draft.roomId;
      }
      if (coachClash) {
        accum.kinds.add("coach");
        accum.coachName = draftCoach;
      }
      const window = overlapWindow(draft.start, draft.end, other.start, other.end);
      for (const date of shared) {
        if (!accum.byDate.has(date)) accum.byDate.set(date, window);
      }
    }
  }

  return [...byParent.entries()].map(([parentId, accum]) => {
    const dates = [...accum.byDate.keys()].sort();
    const nextDate = dates[0];
    const window = accum.byDate.get(nextDate)!;
    return {
      parentId,
      title: accum.title,
      category: accum.category,
      kinds: [...accum.kinds],
      roomName: accum.roomName,
      coachName: accum.coachName,
      next: {
        date: nextDate,
        day: hebrewDayFromIso(nextDate),
        start: window.start,
        end: window.end,
      },
      count: dates.length,
      recurring: dates.length > 1,
    };
  });
}
