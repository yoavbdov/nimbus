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
} from "../lib/seed-dataset";

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
  console.log(`Seeding club "${DEMO_CLUB_ID}"…`);

  await db.doc(clubPath(DEMO_CLUB_ID)).set({
    name: "מועדון הדגמה",
    createdAt: new Date().toISOString(),
  });

  await seedCollection(COLLECTIONS.players, seedPlayers);
  await seedCollection(COLLECTIONS.courses, seedCourses);
  await seedCollection(COLLECTIONS.coaches, seedCoaches);
  await seedCollection(COLLECTIONS.rooms, seedRooms);
  await seedCollection(COLLECTIONS.equipment, seedEquipment);
  await seedCollection(COLLECTIONS.attendance, seedAttendance);
  await seedCollection(COLLECTIONS.leagues, seedLeagues);
  await seedCollection(COLLECTIONS.tournaments, seedTournaments);
  await seedCollection(COLLECTIONS.events, seedEvents);
  await seedCollection(COLLECTIONS.rosters, seedRosters);
  await seedCollection(COLLECTIONS.relations, seedRelations);
  await seedCollection(COLLECTIONS.sessions, seedSessions);
  await seedCollection(COLLECTIONS.ratingTiers, seedRatingTiers);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
