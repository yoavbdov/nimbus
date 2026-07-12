/**
 * Firestore data-access for the `sessions` collection — every scheduled time
 * slot lives here, never embedded in the course/event it belongs to. UI hooks
 * call these; they never talk to Firestore directly.
 *
 * A course's meetings are stored as recurring sessions (weekday + repeat rule),
 * anchored to the course's start date. One-off tournament/event slots keep a
 * single concrete `date`.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import type { SessionDoc } from "@/lib/sessions-data";
import type { MeetingValues } from "@/lib/course-form";

function sessionsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "sessions"));
}

/** Deterministic id for a course meeting so replace stays idempotent. */
function courseSessionId(courseId: string, index: number): string {
  return `${courseId}__meeting__${index}`.replace(/\//g, "／");
}

/** Build a session document from one of a course's form meetings. */
export function sessionFromMeeting(
  courseId: string,
  anchorDate: string,
  meeting: MeetingValues,
  index: number,
): SessionDoc {
  return {
    id: courseSessionId(courseId, index),
    parentType: "course",
    parentId: courseId,
    date: anchorDate,
    start: meeting.startTime,
    end: meeting.endTime,
    roomId: meeting.room,
    day: meeting.day,
    frequency: meeting.frequency,
    endDate: meeting.noEndDate ? "" : meeting.endDate,
    noEndDate: meeting.noEndDate,
  };
}

/** Rebuild a form meeting from a stored recurring session (for the edit flow). */
export function meetingFromSession(session: SessionDoc): MeetingValues {
  return {
    id: session.id,
    day: session.day ?? "",
    room: session.roomId,
    startTime: session.start,
    endTime: session.end,
    frequency: session.frequency ?? "weekly",
    noEndDate: session.noEndDate ?? false,
    endDate: session.endDate ?? "",
  };
}

/** All sessions currently stored for one parent (course/tournament/event). */
async function sessionsForParent(
  parentId: string,
  clubId: string = DEMO_CLUB_ID,
) {
  return getDocs(query(sessionsRef(clubId), where("parentId", "==", parentId)));
}

/**
 * Replace a course's whole meeting set: delete the sessions it had, then write
 * one per current meeting. Runs in a single batch so the swap is atomic.
 */
export async function replaceCourseSessions(
  courseId: string,
  anchorDate: string,
  meetings: MeetingValues[],
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const existing = await sessionsForParent(courseId, clubId);
  const batch = writeBatch(db);
  existing.docs.forEach((d) => batch.delete(d.ref));
  meetings.forEach((meeting, i) => {
    const session = sessionFromMeeting(courseId, anchorDate, meeting, i);
    batch.set(doc(sessionsRef(clubId), session.id), session);
  });
  await batch.commit();
}

/** Deterministic id for a parent's Nth slot so replace stays idempotent. */
export function parentSessionId(parentId: string, index: number): string {
  return `${parentId}__slot__${index}`.replace(/\//g, "／");
}

/**
 * Replace a parent's whole session set: delete the sessions it had, then write
 * the supplied ones. Runs in a single batch so the swap is atomic. Used for
 * tournament rounds and event slots (course meetings use
 * {@link replaceCourseSessions}).
 */
export async function replaceParentSessions(
  parentId: string,
  sessions: SessionDoc[],
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const existing = await sessionsForParent(parentId, clubId);
  const batch = writeBatch(db);
  existing.docs.forEach((d) => batch.delete(d.ref));
  sessions.forEach((session) => {
    batch.set(doc(sessionsRef(clubId), session.id), session);
  });
  await batch.commit();
}

/** Delete every session belonging to a parent (used when the parent is deleted). */
export async function deleteSessionsForParent(
  parentId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const existing = await sessionsForParent(parentId, clubId);
  if (existing.empty) return;
  const batch = writeBatch(db);
  existing.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Create a single one-off session (e.g. a tournament/event slot). */
export function addSession(
  session: SessionDoc,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return setDoc(doc(sessionsRef(clubId), session.id), session);
}

/** Delete one session by id. */
export function deleteSession(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(sessionsRef(clubId), id));
}
