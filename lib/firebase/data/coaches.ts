/**
 * Firestore data-access for the `coaches` collection. UI hooks call these;
 * they never talk to Firestore directly.
 */
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
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
  // Upsert rather than updateDoc: a coach edited from a tournament/event may not
  // have a Firestore doc yet (the roster is larger than the seeded set), and
  // updateDoc throws "No document to update" for a missing doc. The edit patch
  // carries every CoachRecord field, so a merge writes a complete valid doc.
  return setDoc(doc(coachesRef(clubId), id), patch, { merge: true });
}

export function deleteCoach(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(coachesRef(clubId), id));
}
