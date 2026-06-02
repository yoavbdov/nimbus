import { useMemo } from "react";
import { useEventsFilter } from "@/hooks/useEventsFilter";

export function useEventsPanel() {
  const filter = useEventsFilter();
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
