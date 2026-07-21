/**
 * Derives an activity's timing state and its next meeting from its `sessions`
 * — the single source of truth — instead of a hand-authored status. Shared by
 * courses, tournaments and events; each module maps the neutral `TimingState`
 * onto its own (gendered) status label.
 *
 * The boundary is a full date+time: an occurrence counts as "upcoming" only
 * until its start moment passes. So:
 *   • none    — the activity has no sessions at all (never scheduled).
 *   • planned — no occurrence has started yet (everything is still ahead).
 *   • active  — the first occurrence has started, and one is still upcoming.
 *   • ended   — every occurrence is in the past (nothing upcoming).
 */
import type { SessionDoc } from "@/lib/sessions-data";
import type { MeetingFrequency } from "@/lib/course-form";

export type TimingState = "none" | "planned" | "active" | "ended";

export interface ActivityTiming {
  state: TimingState;
  /** Nearest upcoming occurrence, or null when ended / no sessions. */
  nextDate: Date | null;
}

/** How many days one step advances for the fixed-week frequencies. */
const STEP_DAYS: Record<"weekly" | "biweekly" | "triweekly", number> = {
  weekly: 7,
  biweekly: 14,
  triweekly: 21,
};

/** A concrete `Date` from an ISO day + "HH:mm" time (local). */
function toDateTime(iso: string, time: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

/** Advance one occurrence by a recurrence's frequency (keeps the time-of-day). */
function addStep(date: Date, frequency: MeetingFrequency): Date {
  const next = new Date(date);
  if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  else next.setDate(next.getDate() + (STEP_DAYS[frequency as keyof typeof STEP_DAYS] ?? 7));
  return next;
}

/** The session's first occurrence (its anchor date + start time). */
function firstOccurrence(session: SessionDoc): Date {
  return toDateTime(session.date, session.start);
}

/** The earliest occurrence of one session at or after `now`, or null if none. */
function nextOccurrence(session: SessionDoc, now: Date): Date | null {
  const recurring = session.frequency && session.frequency !== "once";
  if (!recurring) {
    const dt = toDateTime(session.date, session.start);
    return dt >= now ? dt : null;
  }
  // Recurrence runs through its end date (inclusive) — or forever when open.
  const endLimit =
    session.noEndDate || !session.endDate
      ? null
      : toDateTime(session.endDate, "23:59");
  let cursor = toDateTime(session.date, session.start);
  // Bounded walk — a wide window across weekly steps stays well under this.
  for (let i = 0; i < 2000; i++) {
    if (endLimit && cursor > endLimit) return null;
    if (cursor >= now) return cursor;
    cursor = addStep(cursor, session.frequency!);
  }
  return null;
}

/**
 * The timing of one activity, computed from its own sessions. Pass only the
 * sessions belonging to the activity.
 */
export function activityTiming(
  sessions: SessionDoc[],
  now: Date = new Date(),
): ActivityTiming {
  if (sessions.length === 0) return { state: "none", nextDate: null };

  let earliest: Date | null = null;
  let next: Date | null = null;
  for (const session of sessions) {
    const first = firstOccurrence(session);
    if (!earliest || first < earliest) earliest = first;
    const upcoming = nextOccurrence(session, now);
    if (upcoming && (!next || upcoming < next)) next = upcoming;
  }

  // Nothing upcoming → every occurrence is in the past.
  if (!next) return { state: "ended", nextDate: null };
  // Nothing has started yet → still planned; the next date is its opening.
  if (earliest && earliest > now) return { state: "planned", nextDate: next };
  return { state: "active", nextDate: next };
}

/** Format a next-meeting date as "DD.MM.YYYY", or "—" when there is none. */
export function formatActivityDate(date: Date | null): string {
  if (!date) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${date.getFullYear()}`;
}
