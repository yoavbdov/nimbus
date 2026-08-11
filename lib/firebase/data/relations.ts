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
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  collectionPath,
  DEMO_CLUB_ID,
  type CollectionName,
} from "@/lib/firebase/collections";
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

/**
 * Enrollment kinds whose live count is mirrored onto a field of the target
 * entity, so the doc's own number stays in sync with the relations that are the
 * source of truth. Kinds not listed here (coach/equipment links) mirror nothing.
 */
const ENROLLMENT_COUNT: Partial<
  Record<RelationKind, { collection: CollectionName; field: string }>
> = {
  player_course: { collection: "courses", field: "enrolled" },
  player_tournament: { collection: "tournaments", field: "participants" },
};

/**
 * Recount the relations of an enrollment `kind` pointing at `targetId` and write
 * that number onto the target entity's count field. No-op for non-enrollment
 * kinds. Called after any add/remove so the denormalised count never drifts.
 */
async function syncEnrollmentCount(
  kind: RelationKind,
  targetId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const mirror = ENROLLMENT_COUNT[kind];
  if (!mirror) return;
  const snapshot = await getDocs(
    query(
      relationsRef(clubId),
      where("kind", "==", kind),
      where("targetId", "==", targetId),
    ),
  );
  const ref = doc(collection(db, collectionPath(clubId, mirror.collection)), targetId);
  await updateDoc(ref, { [mirror.field]: snapshot.size });
}

/** Create (or overwrite) a relation. Idempotent thanks to the deterministic id. */
export async function addRelation(
  rel: Omit<RelationDoc, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  const id = relationId(rel.kind, rel.subjectId, rel.targetId);
  await setDoc(doc(relationsRef(clubId), id), rel);
  await syncEnrollmentCount(rel.kind, rel.targetId, clubId);
}

/** Remove a single relation by its subject/kind/target. */
export async function removeRelation(
  kind: RelationKind,
  subjectId: string,
  targetId: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  await deleteDoc(doc(relationsRef(clubId), relationId(kind, subjectId, targetId)));
  await syncEnrollmentCount(kind, targetId, clubId);
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
  /** Allocated units — used by `equipment_*` links. */
  quantity?: number;
  /** ISO join date — used by `player_course` links (see {@link RelationDoc.joinedOn}). */
  joinedOn?: string;
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
  // A join date belongs to the moment a link was FIRST made, so an existing
  // link keeps its own `joinedOn` through later edits; only brand-new links take
  // the value the caller passes in.
  const existingJoinedOn = new Map<string, string>();
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    const rel = d.data() as RelationDoc;
    if (rel.joinedOn) existingJoinedOn.set(rel.subjectId, rel.joinedOn);
    if (!desired.has(rel.subjectId)) batch.delete(d.ref);
  });
  subjects.forEach(({ subjectId, role, status, quantity, joinedOn }) => {
    const keptJoinedOn = existingJoinedOn.get(subjectId) ?? joinedOn;
    const rel: Omit<RelationDoc, "id"> = {
      kind,
      subjectType,
      subjectId,
      targetType,
      targetId,
      ...(role != null ? { role } : {}),
      ...(status != null ? { status } : {}),
      ...(quantity != null ? { quantity } : {}),
      ...(keptJoinedOn != null ? { joinedOn: keptJoinedOn } : {}),
    };
    batch.set(doc(relationsRef(clubId), relationId(kind, subjectId, targetId)), rel);
  });
  await batch.commit();
  await syncEnrollmentCount(kind, targetId, clubId);
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
