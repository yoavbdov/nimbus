import { useMemo } from "react";
import { useTournamentsFilter } from "@/hooks/useTournamentsFilter";
import { useTournamentsData } from "@/hooks/tournaments/useTournamentsData";
import { OUTSIDE_CLUB_ROOM } from "@/lib/rooms-data";
import type { FieldOptions } from "@/lib/tournaments-filters";

/**
 * Drives the תחרויות page: the tournament list is read live from Firestore
 * (participant count projected from `relations`), then fed into the
 * filter/search hook. `total` is the full live count; `filterKey` re-triggers
 * the table animation on any filter change.
 */
export function useTournamentsPanel() {
  const { tournaments, loading } = useTournamentsData();
  // Live שופט/חדר dropdown options for the filter, sourced from the real
  // tournaments (not the static mock) so a filter matches live data.
  const filterOptions = useMemo<FieldOptions>(
    () => ({
      judge: Array.from(new Set(tournaments.map((t) => t.judge))).sort((a, b) =>
        a.localeCompare(b, "he"),
      ),
      room: Array.from(
        new Set([...tournaments.map((t) => t.room), OUTSIDE_CLUB_ROOM]),
      ).sort((a, b) => a.localeCompare(b, "he")),
    }),
    [tournaments],
  );
  const filter = useTournamentsFilter(tournaments);
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: filter.search,
        filters: filter.filters,
        todayOnly: filter.todayOnly,
      }),
    [filter.search, filter.filters, filter.todayOnly],
  );
  return {
    ...filter,
    tournaments,
    total: tournaments.length,
    loading,
    filterKey,
    filterOptions,
  };
}
