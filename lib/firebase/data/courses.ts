/**
 * Firestore data-access for the `courses` collection. UI hooks call these;
 * they never talk to Firestore directly.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import type { Course } from "@/lib/courses-data";

function coursesRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "courses"));
}

export async function addCourse(
  course: Omit<Course, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const ref = await addDoc(coursesRef(clubId), course);
  return ref.id;
}

export function updateCourse(
  id: string,
  patch: Partial<Course>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(coursesRef(clubId), id), patch);
}

/** Move a course to the archive (a status, not a deletion). */
export function archiveCourse(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateCourse(id, { status: "ארכיון" }, clubId);
}

export function deleteCourse(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(coursesRef(clubId), id));
}
