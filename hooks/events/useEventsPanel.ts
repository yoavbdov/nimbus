import { useMemo } from "react";
import { useEventsFilter } from "@/hooks/useEventsFilter";
import { useEventsData } from "@/hooks/events/useEventsData";
import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";
import type { FieldOptions } from "@/lib/events-filters";

/**
 * Drives the אירועים page: the event list is read live from Firestore, then fed
 * into the filter/search hook. `total` is the full live count; `filterKey`
 * re-triggers the table animation on any filter change.
 */
export function useEventsPanel() {
  const { events, loading } = useEventsData();
  // Live חדר dropdown options for the filter, sourced from the real events
  // (not the static mock) so a filter matches live data.
  const filterOptions = useMemo<FieldOptions>(
    () => ({
      room: Array.from(
        new Set([...events.map((e) => e.room), OUTSIDE_CLUB_ROOM]),
      ).sort((a, b) => a.localeCompare(b, "he")),
    }),
    [events],
  );
  const filter = useEventsFilter(events);
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: filter.search,
        filters: filter.filters,
        todayOnly: filter.todayOnly,
      }),
    [filter.search, filter.filters, filter.todayOnly],
  );
  return { ...filter, events, total: events.length, loading, filterKey, filterOptions };
}
