import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import type { ClubEvent } from "@/lib/events-data";

/**
 * Reads the events live from Firestore. Events carry no derived associations on
 * the main list, so this is a straight read; archived events live only in the
 * Tools archive, not the main list.
 */
export function useEventsData() {
  const { data: records, loading } = useCollection<ClubEvent>("events");

  const events = useMemo<ClubEvent[]>(
    () => records.filter((event) => event.status !== "ארכיון"),
    [records],
  );

  return { events, loading };
}
