/**
 * Firestore data-access for the `equipment` collection. UI hooks call these;
 * they never talk to Firestore directly.
 */
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import type { Equipment } from "@/lib/rooms-data";

function equipmentRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "equipment"));
}

/** Create an equipment item. The document id is the item name. Returns that id. */
export async function addEquipment(
  item: Omit<Equipment, "id">,
  clubId: string = DEMO_CLUB_ID,
): Promise<string> {
  const id = item.name.trim();
  await setDoc(doc(equipmentRef(clubId), id), item);
  return id;
}

/** Patch an existing equipment item (merge, so a partial edit stays valid). */
export function updateEquipment(
  id: string,
  patch: Partial<Equipment>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return setDoc(doc(equipmentRef(clubId), id), patch, { merge: true });
}

/** Permanently remove an equipment item. */
export function deleteEquipment(
  id: string,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return deleteDoc(doc(equipmentRef(clubId), id));
}
