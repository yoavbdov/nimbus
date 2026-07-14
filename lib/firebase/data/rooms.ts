/**
 * Firestore data-access for the `rooms` collection. UI hooks call these; they
 * never talk to Firestore directly.
 */
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import type { Room } from "@/lib/rooms-data";

function roomsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "rooms"));
}

/** Create a room. The document id is the room name. Returns that id. */
export async function addRoom(
  room: Omit<Room, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = room.name.trim();
  await setDoc(doc(roomsRef(clubId), id), room);
  return id;
}

/** Patch an existing room (merge, so a partial edit stays a valid doc). */
export function updateRoom(
  id: string,
  patch: Partial<Room>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return setDoc(doc(roomsRef(clubId), id), patch, { merge: true });
}

/** Permanently remove a room. */
export function deleteRoom(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(roomsRef(clubId), id));
}
