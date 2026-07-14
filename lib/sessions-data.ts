/**
 * Seed data for the `sessions` collection — every scheduled time slot lives
 * here, NOT inside the course/event it belongs to. This is what lets us
 * detect conflicts by querying across courses:
 *
 *   • room conflict:    two sessions, same date + roomId, overlapping times.
 *   • equipment conflict: same idea via equipment relations.
 *   • student conflict: a player linked (relations) to two overlapping sessions.
 *
 * Firestore does not enforce any of this — overlap is checked in app code.
 * Times are "HH:mm" 24h; compare by converting to minutes.
 *
 * The data below is built with two intentional conflicts on 2026-07-05:
 *   - session-1 (course-1, room-1) and session-2 (course-2, room-1) overlap → ROOM conflict.
 *   - player-1 is in course-1 (session-1) and course-3 (session-3), which overlap → STUDENT conflict.
 */

import type { MeetingFrequency } from "@/lib/course-form";
import { COURSE_DAYS, type CourseDay } from "@/lib/courses-data";

export interface SessionDoc {
  id: string;
  /** Which entity this slot belongs to. */
  parentType: "course" | "tournament" | "event";
  parentId: string;
  date: string; // "YYYY-MM-DD" — for a recurring meeting this is the anchor (first) date
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  roomId: string;
  // ── Recurring-meeting fields (a course meeting repeats weekly/… on a weekday).
  // Absent on one-off tournament/event slots, which are pinned to a single date.
  /** Hebrew weekday the meeting runs on, e.g. "שני". */
  day?: string;
  /** How often it repeats; "once" or absent = a single dated slot. */
  frequency?: MeetingFrequency;
  /** Last date the recurrence runs; "" when open-ended. */
  endDate?: string;
  /** True when the meeting repeats indefinitely (no end date). */
  noEndDate?: boolean;
}

const HEBREW_DAY_BY_JS: CourseDay[] = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

/** The Hebrew weekday of an ISO date ("2026-07-01" → "שלישי"); "" when invalid. */
export function hebrewDayFromIso(iso: string): CourseDay | "" {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : HEBREW_DAY_BY_JS[date.getDay()];
}

/**
 * The single weekday one session runs on — the ONE rule shared by courses,
 * tournaments and events. A recurring slot (course meeting / fixed tournament /
 * recurring event) carries an explicit weekday, so we trust that; a one-off or
 * per-round slot is pinned to a concrete date, so we read the weekday off the
 * date. Either way one session yields one day.
 */
export function sessionDay(session: SessionDoc): CourseDay | "" {
  return (session.day as CourseDay) || hebrewDayFromIso(session.date);
}

/** The distinct weekdays a set of sessions runs on, in week order (deduped). */
export function daysFromSessions(sessions: SessionDoc[]): CourseDay[] {
  const set = new Set(sessions.map(sessionDay).filter(Boolean));
  return COURSE_DAYS.filter((d) => set.has(d));
}

/**
 * The activity days of one parent (course/tournament/event) computed live from
 * its sessions in Firestore — the single source of truth the tables show.
 */
export function daysForParent(
  sessions: SessionDoc[],
  parentId: string,
): CourseDay[] {
  return daysFromSessions(sessions.filter((s) => s.parentId === parentId));
}

export const sessions: SessionDoc[] = [
  // room-1 — overlaps with session-2 (16:00–17:30 vs 17:00–18:30).
  { id: "session-1", parentType: "course", parentId: "course-1", date: "2026-07-05", start: "16:00", end: "17:30", roomId: "room-1" },
  // room-1 — room conflict with session-1.
  { id: "session-2", parentType: "course", parentId: "course-2", date: "2026-07-05", start: "17:00", end: "18:30", roomId: "room-1" },
  // room-2 — overlaps session-1 in time; player-1 is in both course-1 and course-3 → student conflict.
  { id: "session-3", parentType: "course", parentId: "course-3", date: "2026-07-05", start: "16:30", end: "18:00", roomId: "room-2" },
  // room-3 — no conflict (different day).
  { id: "session-4", parentType: "course", parentId: "course-1", date: "2026-07-07", start: "16:00", end: "17:30", roomId: "room-3" },
];
