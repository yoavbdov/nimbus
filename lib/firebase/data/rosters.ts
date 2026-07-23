/**
 * Firestore data-access for the `rosters` collection — the saved player lists
 * offered as a source when adding people to a חוג / תחרות / אירוע. UI hooks call
 * these; they never talk to Firestore directly.
 *
 * A roster document is keyed by its name and holds nothing but that name. Its
 * members are `player_roster` relations, so membership follows the same junction
 * pattern as every other association. Because the doc id IS the name, renaming a
 * roster moves its relations too — `renameRoster` does both in one batch.
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
import { replaceTargetRelations } from "@/lib/firebase/data/relations";
import type { RelationDoc } from "@/lib/relations-data";

function rostersRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "rosters"));
}

function relationsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "relations"));
}

/** Same deterministic id scheme as lib/firebase/data/relations.ts. */
function membershipId(playerId: string, rosterId: string): string {
  return `${playerId}__player_roster__${rosterId}`.replace(/\//g, "／");
}

/** Every membership relation of one roster. */
function membershipsOf(rosterId: string, clubId: string = DEMO_CLUB_ID) {
  return getDocs(
    query(
      relationsRef(clubId),
      where("kind", "==", "player_roster"),
      where("targetId", "==", rosterId),
    ),
  );
}

/** Create an empty roster. The document id is the roster name. Returns that id. */
export async function addRoster(
  name: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = name.trim();
  await setDoc(doc(rostersRef(clubId), id), { name: id });
  return id;
}

/**
 * Make a roster's members exactly `playerIds`. Adds and removals both go
 * through the shared junction reconciler.
 */
export function setRosterMembers(
  rosterId: string,
  playerIds: string[],
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return replaceTargetRelations(
    "player_roster",
    "player",
    "roster",
    rosterId,
    playerIds.map((subjectId) => ({ subjectId })),
    clubId,
  );
}

/**
 * Rename a roster. The name is the document id, so this writes a new doc,
 * re-points every membership relation at it, and drops the old one — all in a
 * single batch so the list is never half-moved.
 */
export async function renameRoster(
  rosterId: string,
  newName: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const nextId = newName.trim();
  if (!nextId || nextId === rosterId) return rosterId;

  const memberships = await membershipsOf(rosterId, clubId);
  const batch = writeBatch(db);

  batch.set(doc(rostersRef(clubId), nextId), { name: nextId });
  batch.delete(doc(rostersRef(clubId), rosterId));

  memberships.docs.forEach((d) => {
    const rel = d.data() as RelationDoc;
    batch.delete(d.ref);
    batch.set(doc(relationsRef(clubId), membershipId(rel.subjectId, nextId)), {
      ...rel,
      targetId: nextId,
    });
  });

  await batch.commit();
  return nextId;
}

/** Permanently remove a roster together with its membership relations. */
export async function deleteRoster(
  rosterId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const memberships = await membershipsOf(rosterId, clubId);
  if (!memberships.empty) {
    const batch = writeBatch(db);
    memberships.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  await deleteDoc(doc(rostersRef(clubId), rosterId));
}
