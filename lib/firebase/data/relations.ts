/**
 * Firestore data-access for the `relations` junction collection — the single
 * place every many-to-many link (player↔course, coach↔tournament, …) is
 * created or removed. UI hooks call these; they never talk to Firestore
 * directly.
 *
 * Document ids are DETERMINISTIC — `${subjectId}__${kind}__${targetId}` — so a
 * link is idempotent to add and can be removed without first querying for it.
 * Entity docs are keyed by name, so subject/target ids are Hebrew names; the
 * only character Firestore forbids in a doc id is `/`, which we strip.
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
import type {
  RelationDoc,
  RelationKind,
} from "@/lib/relations-data";

function relationsRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "relations"));
}

/** Firestore-safe deterministic id for a link. */
function relationId(kind: RelationKind, subjectId: string, targetId: string): string {
  return `${subjectId}__${kind}__${targetId}`.replace(/\//g, "／");
}

/** Create (or overwrite) a relation. Idempotent thanks to the deterministic id. */
export function addRelation(
  rel: Omit<RelationDoc, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const id = relationId(rel.kind, rel.subjectId, rel.targetId);
  return setDoc(doc(relationsRef(clubId), id), rel);
}

/** Remove a single relation by its subject/kind/target. */
export function removeRelation(
  kind: RelationKind,
  subjectId: string,
  targetId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(relationsRef(clubId), relationId(kind, subjectId, targetId)));
}

/**
 * Remove every relation of a given kind for one subject. Used for single-valued
 * links (a player's league team) where the previous target may be unknown.
 */
export async function removeRelationsForSubject(
  kind: RelationKind,
  subjectId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const snapshot = await getDocs(
    query(
      relationsRef(clubId),
      where("kind", "==", kind),
      where("subjectId", "==", subjectId),
    ),
  );
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
