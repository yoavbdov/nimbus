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
  RelationSubjectType,
  RelationTargetType,
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

/** One desired subject in a target's relation set (with optional per-link extras). */
export interface RelationSubject {
  subjectId: string;
  role?: string;
  status?: string;
}

/**
 * Make the relations of one KIND pointing at a target exactly match `subjects`:
 * drop the links that are no longer wanted and (over)write the desired ones.
 * Runs in a single batch. This is how a course reconciles its enrolled players,
 * its equipment, or its (single) coach after an edit.
 */
export async function replaceTargetRelations(
  kind: RelationKind,
  subjectType: RelationSubjectType,
  targetType: RelationTargetType,
  targetId: string,
  subjects: RelationSubject[],
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const snapshot = await getDocs(
    query(
      relationsRef(clubId),
      where("kind", "==", kind),
      where("targetId", "==", targetId),
    ),
  );
  const desired = new Set(subjects.map((s) => s.subjectId));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    if (!desired.has((d.data() as RelationDoc).subjectId)) batch.delete(d.ref);
  });
  subjects.forEach(({ subjectId, role, status }) => {
    const rel: Omit<RelationDoc, "id"> = {
      kind,
      subjectType,
      subjectId,
      targetType,
      targetId,
      ...(role != null ? { role } : {}),
      ...(status != null ? { status } : {}),
    };
    batch.set(doc(relationsRef(clubId), relationId(kind, subjectId, targetId)), rel);
  });
  await batch.commit();
}

/**
 * Remove EVERY relation pointing at one target (any kind, any subject). Used
 * when the target entity is deleted, so no dangling links are left behind —
 * e.g. deleting a course drops its player/coach/equipment links.
 */
export async function removeRelationsForTarget(
  targetId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const snapshot = await getDocs(
    query(relationsRef(clubId), where("targetId", "==", targetId)),
  );
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
