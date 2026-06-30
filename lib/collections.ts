/**
 * Firestore layout (multi-tenant, Option A — everything scoped per club):
 *
 *   clubs/{clubId}
 *     ├─ players/{playerId}
 *     ├─ courses/{courseId}
 *     ├─ coaches/{coachId}
 *     ├─ rooms/{roomId}
 *     ├─ equipment/{equipmentId}
 *     ├─ attendance/{classId}
 *     ├─ leagues/{teamId}
 *     ├─ tournaments/{tournamentId}
 *     ├─ events/{eventId}
 *     ├─ relations/{relationId}   ← junction: every many-to-many link
 *     └─ sessions/{sessionId}     ← every scheduled time slot
 *
 * Every club-owned collection lives under its club document, so one club can
 * never read another's data and security rules stay trivial.
 *
 * Relationships are NOT embedded in entity documents. They live in `relations`,
 * a single junction collection holding heterogeneous links (player↔course,
 * coach↔tournament, equipment↔session, …). Times are NOT embedded in events;
 * they live in `sessions`, so room / equipment / player conflicts can be
 * detected by querying across courses.
 */

/** Top-level collection of club (tenant) documents. */
export const CLUBS = "clubs";

/** The single starter/demo club seeded for development. */
export const DEMO_CLUB_ID = "demo-club";

/** Names of the per-club subcollections. */
export const COLLECTIONS = {
  players: "players",
  courses: "courses",
  coaches: "coaches",
  rooms: "rooms",
  equipment: "equipment",
  attendance: "attendance",
  leagues: "leagues",
  tournaments: "tournaments",
  events: "events",
  relations: "relations",
  sessions: "sessions",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Firestore path to a club document, e.g. `clubs/demo-club`. */
export function clubPath(clubId: string): string {
  return `${CLUBS}/${clubId}`;
}

/** Firestore path to a subcollection within a club, e.g. `clubs/demo-club/players`. */
export function collectionPath(clubId: string, collection: CollectionName): string {
  return `${clubPath(clubId)}/${collection}`;
}
