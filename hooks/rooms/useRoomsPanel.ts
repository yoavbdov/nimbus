import { useMemo } from "react";
import { useCollection } from "@/lib/firebase/useCollection";
import { useRoomsFilter } from "@/hooks/rooms/useRoomsFilter";
import type { Room } from "@/lib/rooms-data";

/**
 * Drives the rooms page: the list is read live from Firestore and fed into the
 * search/filter hook. `rooms` is the full live list (for the action modals);
 * `filterKey` re-triggers the table animation.
 */
export function useRoomsPanel() {
  const { data: rooms, loading } = useCollection<Room>("rooms");
  const filter = useRoomsFilter(rooms);
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, rooms, total: rooms.length, filterKey, loading };
}
