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

export interface SessionDoc {
  id: string;
  /** Which entity this slot belongs to. */
  parentType: "course" | "tournament" | "event";
  parentId: string;
  date: string; // "YYYY-MM-DD"
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  roomId: string;
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
