import { useMemo } from "react";
import { useTournamentsFilter } from "@/hooks/useTournamentsFilter";

export function useTournamentsPanel() {
  const filter = useTournamentsFilter();
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: filter.search,
        filters: filter.filters,
        todayOnly: filter.todayOnly,
      }),
    [filter.search, filter.filters, filter.todayOnly],
  );
  return { ...filter, filterKey };
}
