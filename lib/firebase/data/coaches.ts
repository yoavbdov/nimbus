/**
 * Firestore data-access for the `coaches` collection. UI hooks call these;
 * they never talk to Firestore directly.
 */
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import type { CoachRecord } from "@/lib/coaches-data";

function coachesRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "coaches"));
}

/** Create a coach. The document id is the coach name. Returns that id. */
export async function addCoach(
  coach: Omit<CoachRecord, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = coach.name.trim();
  await setDoc(doc(coachesRef(clubId), id), coach);
  return id;
}

export function updateCoach(
  id: string,
  patch: Partial<CoachRecord>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(coachesRef(clubId), id), patch);
}

export function deleteCoach(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(coachesRef(clubId), id));
}
