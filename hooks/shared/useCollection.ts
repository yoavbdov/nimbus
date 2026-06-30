import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collectionPath, DEMO_CLUB_ID, type CollectionName } from "@/lib/collections";

/** A document read back from Firestore, with its id merged in. */
export type WithId<T> = T & { id: string };

export interface CollectionState<T> {
  data: WithId<T>[];
  loading: boolean;
  error: Error | null;
}

/**
 * Generic real-time reader for a club-scoped collection. Subscribes with
 * `onSnapshot` so the UI stays live, and merges each doc's id into the data.
 *
 * The active club is hard-coded to DEMO_CLUB_ID for now; once auth lands this
 * will read the club from the signed-in user's claims.
 */
export function useCollection<T>(
  name: CollectionName,
  clubId: string = DEMO_CLUB_ID,
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const ref = collection(db, collectionPath(clubId, name));
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as WithId<T>,
        );
        setState({ data, loading: false, error: null });
      },
      (error) => setState({ data: [], loading: false, error }),
    );
    return unsubscribe;
  }, [name, clubId]);

  return state;
}
