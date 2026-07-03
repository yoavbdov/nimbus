/**
 * Seed data for the `relations` junction collection — a small, hand-built but
 * internally-consistent graph (real player / coach / course / equipment ids).
 *
 * One collection holds every kind of link. The fields queried on are uniform
 * (`kind`, `subjectType`/`subjectId`, `targetType`/`targetId`); per-kind extras
 * (role, status, …) are optional. To list "who is in course course-1" query
 * targetId == "course-1"; to list "what is player-1 enrolled in" query
 * subjectId == "player-1".
 */

export type RelationSubjectType = "player" | "coach" | "equipment";
export type RelationTargetType =
  | "course"
  | "tournament"
  | "league"
  | "event"
  | "session";

export type RelationKind =
  | "player_course"
  | "player_tournament"
  | "player_league"
  | "coach_course"
  | "coach_tournament"
  | "equipment_course";

export interface RelationDoc {
  id: string;
  kind: RelationKind;
  subjectType: RelationSubjectType;
  subjectId: string;
  targetType: RelationTargetType;
  targetId: string;
  /** Optional per-kind extras. */
  role?: string;
  status?: string;
}

export const relations: RelationDoc[] = [
  // ── players ↔ courses ──────────────────────────────────────────
  // player-1 is in BOTH course-1 and course-3 — used to demonstrate a student
  // double-booking (their sessions overlap; see sessions-data.ts).
  { id: "relation-1", kind: "player_course", subjectType: "player", subjectId: "player-1", targetType: "course", targetId: "course-1" },
  { id: "relation-2", kind: "player_course", subjectType: "player", subjectId: "player-1", targetType: "course", targetId: "course-3" },
  { id: "relation-3", kind: "player_course", subjectType: "player", subjectId: "player-2", targetType: "course", targetId: "course-1" },
  { id: "relation-4", kind: "player_course", subjectType: "player", subjectId: "player-3", targetType: "course", targetId: "course-2" },
  { id: "relation-5", kind: "player_course", subjectType: "player", subjectId: "player-4", targetType: "course", targetId: "course-3" },

  // ── coaches ↔ courses ──────────────────────────────────────────
  { id: "relation-6", kind: "coach_course", subjectType: "coach", subjectId: "coach-1", targetType: "course", targetId: "course-1", role: "מדריך ראשי" },
  { id: "relation-7", kind: "coach_course", subjectType: "coach", subjectId: "coach-3", targetType: "course", targetId: "course-2", role: "מדריך ראשי" },
  { id: "relation-8", kind: "coach_course", subjectType: "coach", subjectId: "coach-10", targetType: "course", targetId: "course-3", role: "מדריך ראשי" },

  // ── equipment ↔ courses ────────────────────────────────────────
  { id: "relation-9", kind: "equipment_course", subjectType: "equipment", subjectId: "equipment-1", targetType: "course", targetId: "course-1" },
  { id: "relation-10", kind: "equipment_course", subjectType: "equipment", subjectId: "equipment-3", targetType: "course", targetId: "course-2" },
];
