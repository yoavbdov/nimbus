/**
 * Firestore data-access for the `players` collection. Every read/write that
 * touches a player lives here — UI hooks call these and never talk to Firestore
 * directly. Split per entity (players, courses, …), not per operation: these
 * are short, share the same collection ref, and read as one unit. Pull a single
 * function out into its own file only once it grows its own real logic.
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
import type { Player } from "@/lib/players-data";

/** The `players` subcollection ref for a club (defaults to the demo club). */
function playersRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "players"));
}

/**
 * Create a player. The document id is the player's full name (e.g. "אלון כהן"),
 * so docs are human-readable in Firestore. Returns that id. Note: two players
 * with the same name would collide on the same document.
 */
export async function addPlayer(
  player: Omit<Player, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = player.name.trim();
  await setDoc(doc(playersRef(clubId), id), player);
  return id;
}

/** Patch an existing player. */
export function updatePlayer(
  id: string,
  patch: Partial<Player>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(playersRef(clubId), id), patch);
}

/** Permanently remove a player. */
export function deletePlayer(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(playersRef(clubId), id));
}
