/**
 * Firestore data-access for the `tournaments` collection. UI hooks call these;
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
import type { Tournament } from "@/lib/tournaments-data";

function tournamentsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "tournaments"));
}

/** Create a tournament. The document id is the tournament name. Returns that id. */
export async function addTournament(
  tournament: Omit<Tournament, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = tournament.name.trim();
  await setDoc(doc(tournamentsRef(clubId), id), tournament);
  return id;
}

export function updateTournament(
  id: string,
  patch: Partial<Tournament>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(tournamentsRef(clubId), id), patch);
}

/** Move a tournament to the archive (a status, not a deletion). */
export function archiveTournament(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateTournament(id, { status: "ארכיון" }, clubId);
}

export function deleteTournament(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(tournamentsRef(clubId), id));
}
