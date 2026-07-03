/**
 * Firestore data-access for the `events` collection. UI hooks call these;
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
import type { ClubEvent } from "@/lib/events-data";

function eventsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "events"));
}

export async function addEvent(
  event: Omit<ClubEvent, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const ref = await addDoc(eventsRef(clubId), event);
  return ref.id;
}

export function updateEvent(
  id: string,
  patch: Partial<ClubEvent>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(eventsRef(clubId), id), patch);
}

export function deleteEvent(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(eventsRef(clubId), id));
}
