/**
 * Projects Firestore `sessions` (+ their parent records) into the flat
 * `ScheduleEvent` occurrences the calendar renders. Pure functions only — the
 * live reads and lookup maps live in `hooks/schedule/useScheduleEvents.ts`.
 *
 * A recurring meeting (course meeting / fixed tournament / recurring event) is
 * expanded into one occurrence per repeat within the visible window; a one-off
 * slot yields at most its single date.
 */
import { addDays, addMonths, fromISODate, toISODate } from "@/lib/calendar";
import type { SessionDoc } from "@/lib/sessions-data";
import type { EventCategory, ScheduleEvent } from "@/lib/schedule-data";
import type { MeetingFrequency } from "@/lib/course-form";

/** The parent record of a session, resolved from its live Firestore doc. */
export interface ParentMeta {
  /** Display title — the parent's Firestore id already IS its name. */
  title: string;
  category: EventCategory;
  /** Course coach / tournament judge; empty for events. */
  coach: string;
  /** Names of the players enrolled in the parent. */
  players: string[];
}

/** How many days one step advances for the fixed-week frequencies. */
const STEP_DAYS: Record<"weekly" | "biweekly" | "triweekly", number> = {
  weekly: 7,
  biweekly: 14,
  triweekly: 21,
};

/** The next occurrence date after `date` for a recurring frequency. */
function nextOccurrence(date: Date, frequency: MeetingFrequency): Date {
  if (frequency === "monthly") return addMonths(date, 1);
  return addDays(date, STEP_DAYS[frequency as keyof typeof STEP_DAYS] ?? 7);
}

/**
 * The concrete dates a session lands on inside [rangeStart, rangeEnd]. A one-off
 * slot (no / `once` frequency) yields its single date when in range; a recurring
 * meeting is stepped from its anchor date by its frequency up to its end date
 * (or the range end when open-ended).
 */
export function occurrencesInRange(
  session: SessionDoc,
  rangeStart: string,
  rangeEnd: string,
): string[] {
  const recurring = session.frequency && session.frequency !== "once";
  if (!recurring) {
    return session.date >= rangeStart && session.date <= rangeEnd
      ? [session.date]
      : [];
  }

  // Stop at the recurrence's own end date, but never past the visible window.
  const hardEnd = session.noEndDate ? rangeEnd : session.endDate || rangeEnd;
  const limit = hardEnd < rangeEnd ? hardEnd : rangeEnd;

  const dates: string[] = [];
  let cursor = fromISODate(session.date);
  // Bounded loop — a wide window across weekly steps stays well under this.
  for (let i = 0; i < 1000; i++) {
    const iso = toISODate(cursor);
    if (iso > limit) break;
    if (iso >= rangeStart) dates.push(iso);
    cursor = nextOccurrence(cursor, session.frequency!);
  }
  return dates;
}

/**
 * Builds every schedule occurrence in [rangeStart, rangeEnd] from the stored
 * sessions. `parentMetaOf` resolves a session's parent (returning `null` skips
 * it — e.g. an archived or missing parent); `roomNameOf` turns a stored room id
 * into its display name.
 */
export function scheduleEventsFromSessions(
  sessions: SessionDoc[],
  parentMetaOf: (session: SessionDoc) => ParentMeta | null,
  roomNameOf: (roomId: string) => string,
  rangeStart: string,
  rangeEnd: string,
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  for (const session of sessions) {
    const meta = parentMetaOf(session);
    if (!meta) continue;
    const location = roomNameOf(session.roomId);
    for (const date of occurrencesInRange(session, rangeStart, rangeEnd)) {
      events.push({
        id: `${session.id}__${date}`,
        parentId: session.parentId,
        parentType: session.parentType,
        title: meta.title,
        category: meta.category,
        date,
        start: session.start,
        end: session.end,
        coach: meta.coach,
        location,
        players: meta.players,
      });
    }
  }
  return events;
}
