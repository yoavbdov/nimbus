/**
 * Firestore data-access for the `events` collection. UI hooks call these;
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
import { deleteSessionsForParent } from "@/lib/firebase/data/sessions";
import { removeRelationsForTarget } from "@/lib/firebase/data/relations";
import type { ClubEvent } from "@/lib/events-data";

function eventsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "events"));
}

/** Create an event. The document id is the event name. Returns that id. */
export async function addEvent(
  event: Omit<ClubEvent, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = event.name.trim();
  await setDoc(doc(eventsRef(clubId), id), event);
  return id;
}

export function updateEvent(
  id: string,
  patch: Partial<ClubEvent>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(eventsRef(clubId), id), patch);
}

/** Move an event to the archive (a status, not a deletion). */
export function archiveEvent(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateEvent(id, { status: "ארכיון" }, clubId);
}

export function deleteEvent(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(eventsRef(clubId), id));
}

/**
 * Delete an event AND everything hanging off it: its sessions and every
 * relation that points at it (enrolled players, its equipment). Leaves no
 * dangling links.
 */
export async function deleteEventCascade(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  await Promise.all([
    deleteSessionsForParent(id, clubId),
    removeRelationsForTarget(id, clubId),
  ]);
  await deleteEvent(id, clubId);
}
