import { useMemo } from "react";
import { rooms as allRooms } from "@/lib/rooms-data";
import { useRoomsFilter } from "@/hooks/rooms/useRoomsFilter";

/** Owns the rooms search + filter state and derives the filtered list + counts. */
export function useRoomsPanel() {
  const filter = useRoomsFilter();
  const filterKey = useMemo(
    () => JSON.stringify({ search: filter.search, filters: filter.filters }),
    [filter.search, filter.filters],
  );
  return { ...filter, total: allRooms.length, filterKey };
}
