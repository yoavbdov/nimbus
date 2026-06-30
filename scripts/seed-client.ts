/**
 * Client-SDK seed (Option B) — writes the mock data into Firestore using the
 * public web config from .env.local, NOT a service account. This works only
 * while security rules are open (test mode); switch to scripts/seed.ts (Admin
 * SDK) before locking the rules down.
 *
 * Run with:  npm run seed:client
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

import { COLLECTIONS, DEMO_CLUB_ID, clubPath } from "../lib/collections";

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
  seedRelations,
  seedSessions,
} from "../lib/seed-dataset";

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
  console.log(`Seeding club "${DEMO_CLUB_ID}" via Client SDK…`);

  await setDoc(doc(db, clubPath(DEMO_CLUB_ID)), {
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
  await seedCollection(COLLECTIONS.relations, seedRelations);
  await seedCollection(COLLECTIONS.sessions, seedSessions);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
