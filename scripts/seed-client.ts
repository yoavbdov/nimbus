/**
 * Client-SDK seed (Option B) — writes the mock data into Firestore using the
 * public web config from .env.local, NOT a service account. This works only
 * while security rules are open (test mode); switch to scripts/seed.ts (Admin
 * SDK) before locking the rules down.
 *
 * Run with:  npm run seed:client
 *
 * Variants (see scripts/seed-mode.ts): --basics writes resources only,
 * --empty wipes the club down to empty collections.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

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

// ── Load .env.local into process.env (tsx does not do this automatically) ────
function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) throw new Error(`Missing .env.local at ${path}`);
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db: Firestore = getFirestore(app);

// ── Helpers ─────────────────────────────────────────────────────────────────
type WithId = { id: string };
const BATCH_LIMIT = 400; // Firestore caps a batch at 500 ops; stay safely under.

/** Commits ops in chunks so we never exceed the per-batch limit. */
async function commitInChunks<T>(
  items: T[],
  apply: (batch: ReturnType<typeof writeBatch>, item: T) => void,
): Promise<void> {
  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const item of items.slice(i, i + BATCH_LIMIT)) apply(batch, item);
    await batch.commit();
  }
}

/** Clears then writes a collection, preserving each item's own `id`. */
async function seedCollection<T extends WithId>(
  collectionName: string,
  items: T[],
): Promise<void> {
  const path = `${clubPath(DEMO_CLUB_ID)}/${collectionName}`;
  const existing = await getDocs(collection(db, path));
  await commitInChunks(existing.docs, (batch, d) => batch.delete(d.ref));
  await commitInChunks(items, (batch, item) => {
    const { id, ...rest } = item;
    batch.set(doc(db, path, id), rest);
  });
  console.log(`  ✓ ${collectionName.padEnd(12)} ${items.length} docs`);
}

// ── Run ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const mode = seedMode();
  console.log(`Seeding club "${DEMO_CLUB_ID}" via Client SDK [${mode}]…`);

  await setDoc(doc(db, clubPath(DEMO_CLUB_ID)), {
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
