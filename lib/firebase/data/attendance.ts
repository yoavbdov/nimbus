/**
 * Firestore data-access for the `attendance` collection — one document PER
 * SESSION (`attendance/{courseId__date}`), each holding that meeting's roster
 * as `entries[studentId] = { status, comment }`. UI hooks call these; they
 * never talk to Firestore directly.
 *
 * A status ("present" / "absent" / "unset") is always STORED, never deleted —
 * so once a student is recorded on a session they stay on it, even at "unset".
 * That is what preserves a departed student's history. A student is taken off a
 * session only by an explicit {@link removeAttendanceEntry}. Merged writes
 * deep-merge the entry, so setting a status keeps an existing comment and
 * vice-versa.
 */
import { deleteField, doc, FieldPath, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import { sessionKey } from "@/lib/attendance-model";
import type { AttendanceMark } from "@/lib/attendance-data";

function sessionDoc(courseId: string, date: string, clubId: string = DEMO_CLUB_ID) {
  return doc(db, collectionPath(clubId, "attendance"), sessionKey(courseId, date));
}

/** Set one student's status on a session (stored even when "unset"). */
export function setAttendanceMark(
  courseId: string,
  date: string,
  studentId: string,
  status: AttendanceMark,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return setDoc(
    sessionDoc(courseId, date, clubId),
    { courseId, date, entries: { [studentId]: { status } } },
    { merge: true },
  );
}

/** Set every listed student's status on a session in a single write. */
export function setAttendanceMarksForSession(
  courseId: string,
  date: string,
  studentIds: string[],
  status: Exclude<AttendanceMark, "unset">,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const entries = Object.fromEntries(studentIds.map((id) => [id, { status }]));
  return setDoc(
    sessionDoc(courseId, date, clubId),
    { courseId, date, entries },
    { merge: true },
  );
}

/** Set one student's comment on a session (keeps their existing status). */
export function setAttendanceComment(
  courseId: string,
  date: string,
  studentId: string,
  comment: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return setDoc(
    sessionDoc(courseId, date, clubId),
    { courseId, date, entries: { [studentId]: { comment } } },
    { merge: true },
  );
}

/** Remove a student from a session entirely (the deliberate "take off" action). */
export function removeAttendanceEntry(
  courseId: string,
  date: string,
  studentId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(
    sessionDoc(courseId, date, clubId),
    new FieldPath("entries", studentId),
    deleteField(),
  ).catch(() => {});
}
