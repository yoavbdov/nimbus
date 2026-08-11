/**
 * Pure attendance projection — the live reads and state live in
 * `hooks/attendance/useAttendancePanel.ts`; this file only transforms data.
 *
 * Two ideas drive the whole feature:
 *
 *  • Session dates are DERIVED from a course's `sessions` (its recurrence
 *    rules), expanded from each meeting's anchor date up to today — never a
 *    hand-authored list. An open-ended course therefore grows one date per
 *    meeting as time passes; a course that ended stops at its last real date.
 *    We never generate a future ("false") date, because attendance is only ever
 *    taken for a meeting that has already happened.
 *
 *  • A session's roster is the UNION of (a) the course's CURRENT members whose
 *    join date is on/before that session and (b) anyone who already has a saved
 *    mark on that session. So a student who left (their `player_course` link was
 *    deleted) vanishes from new sessions yet still shows on the older ones he
 *    was recorded in — his marks, keyed by his id, are never removed.
 */
import { occurrencesInRange } from "@/lib/schedule-events";
import { hebrewDayFromIso, type SessionDoc } from "@/lib/sessions-data";
import type { AttendanceMark, AttendanceSession } from "@/lib/attendance-data";

/**
 * One student's line on a session: their status plus an optional note. "unset"
 * is stored EXPLICITLY (not by omission), so a student who was ever recorded on
 * a session stays on it even after cycling back to "לא הוזן" — which is what
 * keeps a departed student's history from disappearing.
 */
export interface AttendanceEntry {
  status: AttendanceMark;
  comment?: string;
}

/**
 * The attendance document stored PER SESSION (`attendance/{courseId__date}`) —
 * one record of "what happened at this meeting": who was there and each one's
 * status. A course accumulates one small doc per meeting rather than a single
 * ever-growing doc, and every entry is an explicit, persistent membership of
 * that session. See {@link lib/firebase/data/attendance}.
 */
export interface AttendanceSessionDoc {
  id: string;
  courseId: string;
  /** ISO date of the meeting. */
  date: string;
  /** entries[studentId] = their status + note on this session. */
  entries: Record<string, AttendanceEntry>;
}

/** Firestore-safe document id for one course's session on a given ISO date. */
export function sessionKey(courseId: string, date: string): string {
  return `${courseId}__${date}`.replace(/\//g, "／");
}

/** A status counts as "filled" only when it's a real present/absent mark. */
export function isFilled(status: AttendanceMark | undefined): boolean {
  return status === "present" || status === "absent";
}

/** "2026-07-29" → "29.07.2026", the form the UI shows. */
export function displayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

/**
 * A course's attendance sessions: every real past occurrence of its meetings,
 * up to and including `todayIso`, as a sorted, de-duplicated list. The session
 * id IS its ISO date, so the list can be regenerated any day without orphaning
 * a saved mark. `label` is the Hebrew weekday + short date, e.g. "רביעי · 29.07".
 */
export function courseAttendanceSessions(
  courseSessions: SessionDoc[],
  todayIso: string,
): AttendanceSession[] {
  const dates = new Set<string>();
  for (const session of courseSessions) {
    for (const iso of occurrencesInRange(session, session.date, todayIso)) {
      dates.add(iso);
    }
  }
  return [...dates]
    .sort()
    .map((iso) => ({
      id: iso,
      date: displayDate(iso),
      label: `${hebrewDayFromIso(iso)} · ${iso.slice(8)}.${iso.slice(5, 7)}`,
    }));
}

/**
 * Whether a current member counts as enrolled on a given session date. A member
 * with no `joinedOn` has been in the course "from the start"; one with a join
 * date only appears from that date on (inclusive), so a newly-added student
 * never lands on sessions that predate them.
 */
export function memberOnSession(
  joinedOn: string | undefined,
  sessionIso: string,
): boolean {
  return !joinedOn || joinedOn <= sessionIso;
}
