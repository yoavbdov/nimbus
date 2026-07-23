/**
 * Seeds Firestore with the project's mock data, under a single demo club.
 *
 *   clubs/demo-club/{players,courses,coaches,rooms,equipment,
 *                    attendance,leagues,tournaments,events}
 *
 * Run with:  npm run seed
 *
 * Auth: Firebase Admin SDK via a service-account key. Point
 * GOOGLE_APPLICATION_CREDENTIALS at the JSON, or drop it at the repo root as
 * serviceAccountKey.json (gitignored). The Admin SDK bypasses security rules.
 *
 * Idempotent: every seeded collection is cleared before it is rewritten, so
 * re-running produces the same state.
 *
 * Variants (see scripts/seed-mode.ts): --basics writes resources only,
 * --empty wipes the club down to empty collections.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { COLLECTIONS, DEMO_CLUB_ID, clubPath } from "../lib/firebase/collections";

import {
  seedPlayers,
  seedCourses,
  seedCoaches,
  seedRooms,
  seedEquipment,
  seedAttendance,
  seedLeagues,
  seedTournaments,
  seedEvents,
  seedRosters,
  seedRelations,
  seedSessions,
  seedRatingTiers,
  basicsCoaches,
  basicsRooms,
  basicsEquipment,
} from "../lib/seed-dataset";
import { pickFor, seedMode } from "./seed-mode";

// ── Admin SDK init ──────────────────────────────────────────────────────────
function loadCredentials(): ServiceAccount {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const path = fromEnv ?? resolve(process.cwd(), "serviceAccountKey.json");
  if (!existsSync(path)) {
    throw new Error(
      `No service-account key found at "${path}". Generate one in Firebase ` +
        "(Project settings → Service accounts → Generate new private key), " +
        "save it as serviceAccountKey.json at the repo root, then re-run.",
    );
  }
  return JSON.parse(readFileSync(path, "utf8")) as ServiceAccount;
}

const app = initializeApp({ credential: cert(loadCredentials()) });
const db = getFirestore(app);

// ── Helpers ─────────────────────────────────────────────────────────────────
type WithId = { id: string };

/** Deletes every document currently in a collection (batched). */
async function clearCollection(path: string): Promise<void> {
  const snapshot = await db.collection(path).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

/** Clears then writes a collection, preserving each item's own `id`. */
async function seedCollection<T extends WithId>(
  collectionName: string,
  items: T[],
): Promise<void> {
  const path = `${clubPath(DEMO_CLUB_ID)}/${collectionName}`;
  await clearCollection(path);

  const batch = db.batch();
  for (const item of items) {
    const { id, ...rest } = item;
    batch.set(db.collection(path).doc(id), rest);
  }
  await batch.commit();
  console.log(`  ✓ ${collectionName.padEnd(12)} ${items.length} docs`);
}

// ── Run ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const mode = seedMode();
  console.log(`Seeding club "${DEMO_CLUB_ID}" [${mode}]…`);

  await db.doc(clubPath(DEMO_CLUB_ID)).set({
    name: "מועדון הדגמה",
    createdAt: new Date().toISOString(),
  });

  // Every mode reuses the very same path: each collection is cleared, then the
  // list chosen for the mode is written back (possibly empty).
  const pick = pickFor(mode);

  await seedCollection(COLLECTIONS.players, pick(seedPlayers, seedPlayers));
  await seedCollection(COLLECTIONS.courses, pick(seedCourses));
  await seedCollection(COLLECTIONS.coaches, pick(seedCoaches, basicsCoaches));
  await seedCollection(COLLECTIONS.rooms, pick(seedRooms, basicsRooms));
  await seedCollection(COLLECTIONS.equipment, pick(seedEquipment, basicsEquipment));
  await seedCollection(COLLECTIONS.attendance, pick(seedAttendance));
  await seedCollection(COLLECTIONS.leagues, pick(seedLeagues));
  await seedCollection(COLLECTIONS.tournaments, pick(seedTournaments));
  await seedCollection(COLLECTIONS.events, pick(seedEvents));
  await seedCollection(COLLECTIONS.rosters, pick(seedRosters));
  await seedCollection(COLLECTIONS.relations, pick(seedRelations));
  await seedCollection(COLLECTIONS.sessions, pick(seedSessions));
  await seedCollection(COLLECTIONS.ratingTiers, pick(seedRatingTiers, seedRatingTiers));

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
