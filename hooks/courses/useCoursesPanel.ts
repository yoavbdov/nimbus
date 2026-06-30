import { useMemo } from "react";
import { useActivitiesFilter } from "@/hooks/useActivitiesFilter";

export function useActivitiesPanel() {
  const filter = useActivitiesFilter();
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
