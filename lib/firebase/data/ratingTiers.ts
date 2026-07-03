/**
 * Firestore data-access for the `ratingTiers` collection (dashboard rating
 * bands). Reads go through useCollection; this holds the writes.
 */
import { doc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collectionPath, DEMO_CLUB_ID } from "@/lib/firebase/collections";
import type { RatingTier } from "@/lib/rating-tiers-data";

function ratingTiersRef(clubId: string = DEMO_CLUB_ID) {
  return collection(db, collectionPath(clubId, "ratingTiers"));
}

/** Patch a tier's label and/or range. */
export function updateRatingTier(
  id: string,
  patch: Partial<Omit<RatingTier, "id">>,
  clubId: string = DEMO_CLUB_ID,
): Promise<void> {
  return updateDoc(doc(ratingTiersRef(clubId), id), patch);
}
